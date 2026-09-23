'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Mail, Eye, EyeOff, ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Inline Google icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [ageRange, setAgeRange] = useState<'below18' | 'above18' | null>(null);
  const [language, setLanguage] = useState('English');
  const [step, setStep] = useState(1); // 1 = auth, 2 = onboarding (signup only)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const languages = ['English', 'Hindi', 'French', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali'];

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
          },
        });
        if (!error) return;
      }
    } catch (err) {
      console.warn('Supabase OAuth note:', err);
    }

    if (mode === 'signup') {
      setStep(2);
      setGoogleLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && step === 1) {
      setStep(2);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
      {/* BG orbs */}
      <motion.div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', top: '-10%', right: '-5%', pointerEvents: 'none' }}
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)', bottom: '-5%', left: '-5%', pointerEvents: 'none' }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Back to home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>
              Meet<span className="gradient-text">Flow</span>
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {step === 2 ? 'Just a few more details' : mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: '2rem' }}>
          {/* Step indicator for signup */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 999, background: s <= step ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              {/* Toggle tabs */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.25rem', marginBottom: '1.5rem' }}>
                {(['signin', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      background: mode === m ? 'var(--color-accent)' : 'transparent',
                      color: mode === m ? 'white' : 'var(--color-text-secondary)',
                    }}
                  >
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Google OAuth — FR-1 */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 12,
                  marginBottom: '1.25rem',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  opacity: googleLoading ? 0.8 : 1,
                }}
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>

              {/* Email form — FR-1 */}
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      id="email"
                      className="input-glass"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="you@college.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="input-glass"
                      style={{ paddingRight: '2.75rem' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'signin' && (
                  <div style={{ textAlign: 'right' }}>
                    <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--color-accent-light)', textDecoration: 'none' }}>Forgot password?</a>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: 12, fontSize: '0.9375rem' }}>
                  {mode === 'signin' ? 'Sign In' : 'Continue'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* FR-2: Age range confirmation */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Your age range</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {([['below18', 'Below 18'], ['above18', 'Above 18']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAgeRange(val)}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: 10, border: `1px solid ${ageRange === val ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: ageRange === val ? 'rgba(108,99,255,0.12)' : 'transparent',
                        color: ageRange === val ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FR-3: Language preference */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={14} /> Language preference
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {languages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      style={{
                        padding: '0.625rem', borderRadius: 10, border: `1px solid ${language === lang ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: language === lang ? 'rgba(108,99,255,0.12)' : 'transparent',
                        color: language === lang ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s', textAlign: 'left',
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem', borderRadius: 12 }}>Back</button>
                <button type="button" onClick={() => router.push('/dashboard')} className="btn-primary" style={{ flex: 2, padding: '0.75rem', borderRadius: 12 }}>
                  Complete Setup →
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
