'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { setLocalUser } from '@/lib/auth';
import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncUser = (session: any) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setLocalUser({
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: meta.role || 'student',
          language: meta.language_preference || 'English',
          birthYear: meta.birth_year,
          ageRange: meta.is_adult ? 'above18' : 'below18',
          isLoggedIn: true,
          authProvider: 'google',
          avatarUrl: meta.avatar_url || meta.picture,
        });
      }
    };

    async function handleAuth() {
      try {
        // If code is in URL search params (PKCE flow), exchange it on client
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!cancelled && data.session) {
            syncUser(data.session);
            router.replace('/dashboard');
            return;
          }
        }

        // If implicit flow or already processed by Supabase client
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!cancelled) {
          if (session) {
            syncUser(session);
            router.replace('/dashboard');
          } else {
            // Listen for immediate auth state change
            const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
              if (newSession) {
                syncUser(newSession);
                listener.subscription.unsubscribe();
                router.replace('/dashboard');
              }
            });

            // Timeout after 4 seconds if no session resolved
            setTimeout(() => {
              if (!cancelled) {
                listener.subscription.unsubscribe();
                router.replace('/auth/login?error=auth_timeout');
              }
            }, 4000);
          }
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        if (!cancelled) {
          setErrorMsg(err.message || 'Authentication failed. Redirecting to login...');
          setTimeout(() => router.replace('/auth/login?error=oauth_failed'), 2000);
        }
      }
    }

    handleAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', padding: '1rem' }}>
      {errorMsg ? (
        <div style={{ textAlign: 'center', color: '#f87171', fontSize: '0.9rem', maxWidth: 400 }}>
          {errorMsg}
        </div>
      ) : (
        <NewtonsCradleLoader size={54} speed={1.2} color="#a78bfa" label="Signing you in to MeetFlow..." />
      )}
    </div>
  );
}
