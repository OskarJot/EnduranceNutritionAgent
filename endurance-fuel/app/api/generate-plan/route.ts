import type { NextRequest } from 'next/server';
import type { PlanZywieniowy, UserProfile } from '@/lib/types';

const ADK_BASE = process.env.ADK_BASE_URL ?? 'http://localhost:8080';

interface GenerateRequest {
  profile: UserProfile;
  trainingPlan: string;
  weekStart: string;
}

async function createSession(userId: string): Promise<string> {
  const res = await fetch(`${ADK_BASE}/apps/app/users/${userId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: {} }),
  });
  if (!res.ok) throw new Error(`Session creation failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

function buildMessage(profile: UserProfile, weekStart: string, trainingPlan: string): string {
  const goalMap: Record<string, string> = {
    'Redukcja':       'redukcja',
    'Faza bazowa':    'bazowy',
    'Faza budowania': 'budowanie',
    'BPS / Start':    'BPS',
  };
  return (
    `Waga: ${profile.weight} kg, Płeć: ${profile.gender}, ` +
    `Cel: ${goalMap[profile.goal] ?? profile.goal}, Lokalizacja: ${profile.location}\n` +
    `Tydzień od: ${weekStart}\n\n` +
    trainingPlan.trim()
  );
}

function tryParsePlan(value: unknown): PlanZywieniowy | null {
  if (!value) return null;
  try {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    if (obj?.dni && Array.isArray(obj.dni) && obj.dni.length > 0) {
      return obj as PlanZywieniowy;
    }
  } catch { /* skip */ }
  return null;
}

function extractSSEError(raw: string): string | null {
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    let event: Record<string, unknown>;
    try { event = JSON.parse(line.slice(6)); } catch { continue; }

    const errMsg = event?.error_message ?? event?.error;
    if (typeof errMsg === 'string' && errMsg) return errMsg;

    // ADK wraps LLM errors in error_code + message
    const errorCode = event?.error_code;
    if (errorCode) return `ADK error_code=${errorCode}: ${errMsg ?? JSON.stringify(event)}`;
  }
  return null;
}

function parseSSEEvents(raw: string): PlanZywieniowy | null {
  const lines = raw.split('\n');
  let lastPlan: PlanZywieniowy | null = null;

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line.slice(6));
    } catch {
      continue;
    }

    // 1. ADK state_delta — where output_key lands
    const stateDelta = event?.actions as Record<string, unknown>;
    const stateDeltaInner = stateDelta?.state_delta as Record<string, unknown>;
    const planFromState = stateDeltaInner?.plan_zywieniowy;
    if (planFromState) {
      const p = tryParsePlan(planFromState);
      if (p) lastPlan = p;
    }

    // 2. Fallback: content.parts[].text (raw model JSON)
    const parts = (event?.content as Record<string, unknown>)?.parts;
    if (Array.isArray(parts)) {
      for (const part of parts) {
        const text = (part as Record<string, unknown>)?.text;
        if (typeof text === 'string') {
          const p = tryParsePlan(text);
          if (p) lastPlan = p;
        }
      }
    }

    // 3. Top-level state map
    const state = event?.state as Record<string, unknown> | undefined;
    if (state?.plan_zywieniowy) {
      const p = tryParsePlan(state.plan_zywieniowy);
      if (p) lastPlan = p;
    }
  }

  return lastPlan;
}

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { profile, trainingPlan, weekStart } = body;
  if (!profile || !trainingPlan || !weekStart) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const sessionId = await createSession(profile.id);
    const message = buildMessage(profile, weekStart, trainingPlan);

    const adkRes = await fetch(`${ADK_BASE}/run_sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_name: 'app',
        user_id: profile.id,
        session_id: sessionId,
        new_message: {
          role: 'user',
          parts: [{ text: message }],
        },
        streaming: true,
      }),
      // 3 minuty — pipeline LLM może trwać długo
      signal: AbortSignal.timeout(180_000),
    });

    if (!adkRes.ok) {
      const errText = await adkRes.text();
      return Response.json({ error: `ADK error: ${adkRes.status} — ${errText}` }, { status: 502 });
    }

    const rawSSE = await adkRes.text();
    const plan = parseSSEEvents(rawSSE);

    if (!plan) {
      const adkError = extractSSEError(rawSSE);
      const preview = rawSSE.slice(0, 2000);
      return Response.json(
        {
          error: adkError
            ? `Błąd ADK: ${adkError}`
            : 'Plan nie znaleziony w odpowiedzi ADK',
          debug: preview,
        },
        { status: 502 }
      );
    }

    // Pobierz pełny stan sesji (intermediate outputs wszystkich agentów)
    let debug: Record<string, unknown> = {};
    try {
      const sessionRes = await fetch(
        `${ADK_BASE}/apps/app/users/${profile.id}/sessions/${sessionId}`,
        { signal: AbortSignal.timeout(5_000) }
      );
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        debug = sessionData.state ?? {};
      }
    } catch {
      // debug jest best-effort — nie blokuje odpowiedzi
    }

    return Response.json({ plan, debug });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }
}
