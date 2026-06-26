'use client';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import ProfileForm from '@/components/ProfileForm';
import { Zap } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-lime-500 mb-3">
            <Zap size={28} fill="currentColor" />
            <span className="text-2xl font-black tracking-tight">EnduranceFuel</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-2">
            {profile ? 'Edytuj profil' : 'Twój profil'}
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Dane potrzebne do personalizacji planu żywieniowego
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <ProfileForm
            initial={profile}
            onSave={(p) => {
              saveProfile(p);
              router.push('/');
            }}
          />
        </div>
      </div>
    </div>
  );
}
