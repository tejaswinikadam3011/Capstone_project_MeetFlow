'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalUser, setLocalUser, clearLocalUser, MeetFlowUser } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type UseAuthReturn = {
  user: MeetFlowUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

/**
 * useAuth — reads the current session from either Supabase or localStorage.
 * When requireAuth = true, redirects to /auth/login if no session is found.
 */
export function useAuth(requireAuth = true): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<MeetFlowUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      // If Supabase is configured, use real Supabase session
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          const session = data?.session;

          if (!cancelled) {
            if (session?.user) {
              const meta = session.user.user_metadata || {};
              const resolvedUser: MeetFlowUser = {
                name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: meta.role || 'student',
                language: meta.language_preference || 'English',
                birthYear: meta.birth_year,
                ageRange: meta.is_adult ? 'above18' : 'below18',
                isLoggedIn: true,
                authProvider: (session.user.app_metadata?.provider as any) || 'email',
                avatarUrl: meta.avatar_url || meta.picture,
              };
              setLocalUser(resolvedUser);
              setUser(resolvedUser);
              setLoading(false);
              return;
            } else {
              // Check if a local session exists (demo or fallback)
              const localUser = getLocalUser();
              if (localUser) {
                setUser(localUser);
                setLoading(false);
                return;
              }
              clearLocalUser();
              setUser(null);
              setLoading(false);
              if (requireAuth) {
                router.replace('/auth/login');
              }
              return;
            }
          }
        } catch (err) {
          console.error('Session load error:', err);
          if (!cancelled) {
            const localUser = getLocalUser();
            if (localUser) {
              setUser(localUser);
              setLoading(false);
              return;
            }
            clearLocalUser();
            setUser(null);
            setLoading(false);
            if (requireAuth) router.replace('/auth/login');
            return;
          }
        }
      }

      // Fallback: Demo mode (only when Supabase keys are not present)
      if (!cancelled) {
        const localUser = getLocalUser();
        if (localUser) {
          setUser(localUser);
        } else if (requireAuth) {
          router.replace('/auth/login');
        }
        setLoading(false);
      }
    }

    loadSession();

    // Listen to real-time auth changes
    let unsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured()) {
      const { data: listener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (cancelled) return;

          if (session?.user) {
            const meta = session.user.user_metadata || {};
            setUser({
              name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: meta.role || 'student',
              language: meta.language_preference || 'English',
              birthYear: meta.birth_year,
              ageRange: meta.is_adult ? 'above18' : 'below18',
              isLoggedIn: true,
              authProvider: (session.user.app_metadata?.provider as any) || 'email',
              avatarUrl: meta.avatar_url || meta.picture,
            });
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            clearLocalUser();
            setUser(null);
            setLoading(false);
            if (requireAuth) router.replace('/auth/login');
          }
        }
      );
      unsubscribe = () => listener.subscription.unsubscribe();
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [requireAuth, router]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut().catch(() => {});
    }
    clearLocalUser();
    setUser(null);
    router.replace('/auth/login');
  }, [router]);

  return { user, loading, signOut };
}
