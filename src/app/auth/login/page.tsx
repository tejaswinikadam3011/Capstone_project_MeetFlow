'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video, Mail, Eye, EyeOff, Loader2,
  CheckCircle2, AlertCircle, User, Lock, Calendar,
  X, ShieldCheck,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLocalUser, setLocalUser, clearLocalUser } from '@/lib/auth';
import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

// ── Google Icon SVG ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);


const LANGUAGES = ['English', 'French', 'Hindi', 'Spanish', 'Tamil', 'Telugu', 'German', 'Marathi'];
const BIRTH_YEARS = Array.from({ length: 50 }, (_, i) => String(2010 - i));

export default function LoginPage() {
  const router = useRouter();

  // If already logged in with active session, skip to dashboard
  useEffect(() => {
    let active = true;
    async function checkExistingSession() {
      if (isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession();
        if (active) {
          if (data?.session) {
            router.replace('/dashboard');
          } else {
            clearLocalUser();
          }
        }
      } else {
        if (active && getLocalUser()) {
          router.replace('/dashboard');
        }
      }
    }
    checkExistingSession();
    return () => { active = false; };
  }, [router]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [mode, setMode]                 = useState<'signin' | 'signup'>('signin');
  const [step, setStep]                 = useState<1 | 2>(1);
  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPassword, setShowPwd]      = useState(false);
  const [birthYear, setBirthYear]       = useState('2003');
  const [ageRange, setAgeRange]         = useState<'below18' | 'above18'>('above18');
  const [language, setLanguage]         = useState('English');
  const [role, setRole]                 = useState<'student' | 'faculty'>('student');

  // ── UI state ───────────────────────────────────────────────────────────────
  const [loading, setLoading]           = useState(false);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [successMsg, setSuccessMsg]     = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotModal, setForgotModal]   = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearMessages = () => { setErrorMsg(null); setSuccessMsg(null); };

  /** Persist user locally and navigate to dashboard */
  const loginSuccess = (userData: {
    name: string; email: string; role: 'student' | 'faculty';
    language: string; birthYear?: string; ageRange?: 'below18' | 'above18';
    authProvider?: 'email' | 'google';
  }) => {
    setLocalUser({ ...userData, isLoggedIn: true });
    setSuccessMsg('Welcome to MeetFlow! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 800);
  };

  // ── Google OAuth (real Supabase OAuth) ────────────────────────────────────
  const handleGoogleSignIn = async () => {
    clearMessages();
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      // Browser will redirect to Google — no further action needed here
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
    }
  };

  // ── Email / Password submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // ── SIGNUP Step 1 — validate then advance to preferences
    if (mode === 'signup' && step === 1) {
      if (!fullName.trim()) return setErrorMsg('Please enter your full name.');
      if (!email.trim())    return setErrorMsg('Please enter your email address.');
      if (password.length < 6) return setErrorMsg('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');
      setStep(2);
      return;
    }

    // ── SIGNUP Step 2 — create account
    if (mode === 'signup' && step === 2) {
      setLoading(true);
      try {
        if (isSupabaseConfigured()) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, role, language_preference: language, birth_year: parseInt(birthYear), is_adult: ageRange === 'above18' },
            },
          });
          if (error) throw error;
        }
        loginSuccess({ name: fullName, email, role, language, birthYear, ageRange, authProvider: 'email' });
      } catch (err: any) {
        setErrorMsg(err?.message || 'Sign up failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── SIGN IN
    if (!email.trim() || !password.trim()) return setErrorMsg('Please enter your email and password.');
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const derivedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      loginSuccess({ name: derivedName, email, role: 'student', language: 'English', authProvider: 'email' });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      if (isSupabaseConfigured()) await supabase.auth.resetPasswordForEmail(forgotEmail);
    } catch {}
    setForgotSent(true);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem' }}>

      {/* Ambient background orbs */}
      <motion.div style={{ position: 'absolute', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)', top: '-10%', right: '-5%', pointerEvents: 'none' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.14) 0%, transparent 70%)', bottom: '-5%', left: '-5%', pointerEvents: 'none' }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}>

        {/* ── Logo Header ─────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', marginBottom: '1.25rem', opacity: 0.6 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>← Back to home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(108,99,255,0.4)' }}>
              <Video size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#ffffff' }}>
              Meet<span className="gradient-text">Flow</span>
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {step === 2
              ? 'Set up your preferences to complete signup'
              : mode === 'signin'
              ? 'Sign in to access your meetings & AI summaries'
              : 'Create your smart collaborative account'}
          </p>
        </div>

        {/* ── Glass Card ──────────────────────────────────────────────── */}
        <div className="glass" style={{ borderRadius: 24, padding: '2.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}>

          {/* Step progress (signup) */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--color-accent)' }} />
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: step === 2 ? '#00d4aa' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
            </div>
          )}

          {/* Sign In / Sign Up toggle */}
          {step === 1 && (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.3rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['signin', 'signup'] as const).map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); clearMessages(); setStep(1); }}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s', background: mode === m ? 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)' : 'transparent', color: mode === m ? '#ffffff' : 'var(--color-text-secondary)', boxShadow: mode === m ? '0 2px 10px rgba(108,99,255,0.3)' : 'none' }}>
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* Alert banners */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1: Credentials ───────────────────────────────────── */}
          {step === 1 && (
            <>
              {/* Google OAuth Button */}
              <button id="google-signin-btn" type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.85rem', borderRadius: 14, marginBottom: '1.5rem', cursor: googleLoading ? 'wait' : 'pointer', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', fontWeight: 600, fontSize: '0.9375rem', color: '#ffffff', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', opacity: googleLoading ? 0.7 : 1 }}
                onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}>
                {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <form id="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {mode === 'signup' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input id="full-name" type="text" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="Alex Morgan" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input id="email-input" type="email" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="student@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input id="password-input" type={showPassword ? 'text' : 'password'} className="input-glass" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPwd(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input id="confirm-password" type={showPassword ? 'text' : 'password'} className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#6c63ff' }} /> Remember me
                    </label>
                    <button type="button" onClick={() => setForgotModal(true)} style={{ background: 'none', border: 'none', color: '#8b85ff', cursor: 'pointer', fontSize: '0.8125rem' }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <button id="auth-submit-btn" type="submit" disabled={loading}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: 14, fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)', border: 'none', color: 'white', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  <span>{mode === 'signin' ? 'Sign In' : 'Continue to Preferences →'}</span>
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: Onboarding Preferences (FR-2 & FR-3) ─────────── */}
          {step === 2 && (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Role */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--color-text-secondary)' }}>I am joining as:</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {(['student', 'faculty'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: `1px solid ${role === r ? 'var(--color-accent)' : 'var(--color-border)'}`, background: role === r ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)', color: role === r ? '#ffffff' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                      {r === 'student' ? '🎓 Student / Attendee' : '👨‍🏫 Faculty / Host'}
                    </button>
                  ))}
                </div>
              </div>

              {/* FR-2: Birth Year & Age Confirmation */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
                  <Calendar size={15} color="#00d4aa" /> Birth Year & Age Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <select id="birth-year" className="input-glass" value={birthYear} onChange={e => setBirthYear(e.target.value)} style={{ cursor: 'pointer', borderRadius: 12 }}>
                    {BIRTH_YEARS.map(yr => (
                      <option key={yr} value={yr} style={{ background: '#0d1117', color: '#ffffff' }}>Born in {yr}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['below18', 'above18'] as const).map(ag => (
                      <button key={ag} type="button" onClick={() => setAgeRange(ag)}
                        style={{ flex: 1, padding: '0.625rem', borderRadius: 10, border: `1px solid ${ageRange === ag ? '#00d4aa' : 'var(--color-border)'}`, background: ageRange === ag ? 'rgba(0,212,170,0.1)' : 'transparent', color: ageRange === ag ? '#00d4aa' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s' }}>
                        {ag === 'below18' ? '< 18' : '18+'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FR-3: Language */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--color-text-secondary)' }}>Preferred Language</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {LANGUAGES.map(lang => (
                    <button key={lang} type="button" onClick={() => setLanguage(lang)}
                      style={{ padding: '0.5rem 0.25rem', borderRadius: 10, border: `1px solid ${language === lang ? 'var(--color-accent)' : 'var(--color-border)'}`, background: language === lang ? 'rgba(108,99,255,0.15)' : 'transparent', color: language === lang ? '#a78bfa' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <button id="complete-signup-btn" type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.875rem', borderRadius: 14, fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)', border: 'none', color: 'white', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                <span>{loading ? 'Creating account...' : 'Complete Sign Up'}</span>
              </button>

              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'center' }}>
                ← Back
              </button>
            </motion.form>
          )}
        </div>


      </motion.div>



      {/* ── Forgot Password Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {forgotModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setForgotModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="glass" style={{ width: '100%', maxWidth: 400, borderRadius: 20, padding: '2rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setForgotModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Email Sent!</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Check your inbox for a password reset link.</p>
                  <button onClick={() => { setForgotModal(false); setForgotSent(false); }} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: 12 }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Reset Password</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Enter your email address and we'll send you a reset link.</p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input id="forgot-email" type="email" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="you@college.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem', borderRadius: 12 }}>Send Reset Link</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
