'use client';
import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        localStorage.removeItem('userProfile');
      }
    }
    setLoaded(true);
  }, []);

  const saveProfile = (p: UserProfile) => {
    localStorage.setItem('userProfile', JSON.stringify(p));
    setProfile(p);
  };

  const clearProfile = () => {
    localStorage.removeItem('userProfile');
    setProfile(null);
  };

  return { profile, saveProfile, clearProfile, loaded };
}
