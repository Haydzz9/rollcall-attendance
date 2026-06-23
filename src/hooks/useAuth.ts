import { useCallback, useEffect, useState } from 'react';
import { initIdentity, signOutIdentity } from '../lib/googleIdentity';
import { isGoogleConfigured } from '../config';
import type { GoogleProfile } from '../types';

export function useAuth() {
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configured] = useState(isGoogleConfigured());

  useEffect(() => {
    initIdentity(
      (p) => {
        setProfile(p);
        setError(null);
      },
      () => setError('Sign-in failed — please try again.')
    );
  }, []);

  const signOut = useCallback(() => {
    signOutIdentity();
    setProfile(null);
  }, []);

  return { profile, error, configured, signOut };
}
