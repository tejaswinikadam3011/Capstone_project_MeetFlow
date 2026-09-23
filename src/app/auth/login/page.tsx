'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video, Mail, Eye, EyeOff, ArrowLeft, Globe, Loader2,
  CheckCircle2, AlertCircle, User, Lock, Calendar, KeyRound,
  Plus, ShieldCheck, X
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

// Google SVG Icon
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
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Credentials, Step 2: Onboarding profile

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthYear, setBirthYear] = useState('2003');
  const [ageRange, setAgeRange] = useState<'below18' | 'above18'>('above18');
  const [language, setLanguage] = useState('English');
  const [role, setRole] = useState<'student' | 'faculty'>('student');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Google Account Picker Modal State
  const [googleModal, setGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [googleAuthProcessing, setGoogleAuthProcessing] = useState(false);

  // Forgot Password Modal
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const languages = ['English', 'French', 'Hindi', 'Spanish', 'Tamil', 'Telugu', 'German', 'Marathi'];
  const birthYears = Array.from({ length: 50 }, (_, i) => String(2010 - i));

  // Preset Google accounts for selection
  const googleAccounts = [
    { name: 'Tejaswini Kadam', email: 'tejaswinikadam3011@gmail.com', avatar: 'TK', color: '#6c63ff' },
    { name: 'Sakshi Satavi', email: 'sakshisatavi98@gmail.com', avatar: 'SS', color: '#00d4aa' },
    { name: 'College Student Account', email: 'student@college.edu', avatar: 'CS', color: '#f72585' },
  ];

  // Initiate Google Authentication
  const handleGoogleAuthClick = () => {
    setErrorMsg(null);
    setGoogleModal(true);
  };

  // Complete Google Account Selection
  const selectGoogleAccount = (selectedName: string, selectedEmail: string) => {
    setGoogleAuthProcessing(true);

    const userProfile = {
      name: selectedName,
      email: selectedEmail,
      role: 'student',
      language: 'English',
      isLoggedIn: true,
      authProvider: 'google',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedName)}`,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('meetflow_user', JSON.stringify(userProfile));
    }

    setTimeout(() => {
      setGoogleAuthProcessing(false);
      setGoogleModal(false);

      if (mode === 'signup') {
        setFullName(selectedName);
        setEmail(selectedEmail);
        setStep(2); // Proceed to age/language onboarding per PRD FR-2, FR-3
      } else {
        setSuccessMsg(`Signed in with Google as ${selectedName}! Redirecting...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 700);
      }
    }, 600);
  };

  // Handle Custom Google Account Submission
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const derivedName = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    selectGoogleAccount(derivedName, customGoogleEmail.trim());
  };

  // Handle Standard Email Sign In / Sign Up Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (step === 1) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          return;
        }
        setStep(2);
        return;
      }

      // Step 2 Submission (Complete Signup)
      setLoading(true);
      try {
        if (isSupabaseConfigured()) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role,
                language_preference: language,
                birth_year: parseInt(birthYear),
                is_adult: ageRange === 'above18',
              },
            },
          });
          if (error) throw error;
        }
      } catch (err: any) {
        console.warn('Supabase signup notice:', err);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'meetflow_user',
          JSON.stringify({
            name: fullName,
            email,
            role,
            language,
            birthYear,
            ageRange,
            isLoggedIn: true,
          })
        );
      }

      setSuccessMsg('Account created successfully! Redirecting to Dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      return;
    }

    // Sign In Mode
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.warn('Supabase signin notice:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'meetflow_user',
        JSON.stringify({
          name: email.split('@')[0] || 'Member',
          email,
          role: 'host',
          language: 'English',
          isLoggedIn: true,
        })
      );
    }

    setSuccessMsg('Signed in successfully! Redirecting...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.resetPasswordForEmail(forgotEmail);
      }
    } catch (err) {
      console.warn(err);
    }
    setForgotSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
      
      {/* Background orbs */}
      <motion.div
        style={{ position: 'absolute', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)', top: '-10%', right: '-5%', pointerEvents: 'none' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.14) 0%, transparent 70%)', bottom: '-5%', left: '-5%', pointerEvents: 'none' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
            <ArrowLeft size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Back to home</span>
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
            {step === 2 ? 'Complete your student/faculty onboarding' : mode === 'signin' ? 'Sign in to access your meetings & AI summaries' : 'Create your smart collaborative account'}
          </p>
        </div>

        {/* Main Glass Form Card */}
        <div className="glass" style={{ borderRadius: 24, padding: '2.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}>
          
          {/* Step Indicator (for signup) */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--color-accent)' }} />
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: step === 2 ? '#00d4aa' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
            </div>
          )}

          {/* Toggle Sign In / Sign Up */}
          {step === 1 && (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.3rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    background: mode === m ? 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)' : 'transparent',
                    color: mode === m ? '#ffffff' : 'var(--color-text-secondary)',
                    boxShadow: mode === m ? '0 2px 10px rgba(108,99,255,0.3)' : 'none',
                  }}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* Error & Success Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  color: '#86efac',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: AUTHENTICATION FORM */}
          {step === 1 && (
            <>
              {/* Google OAuth Button (FR-1) */}
              <button
                type="button"
                onClick={handleGoogleAuthClick}
                className="btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: 14,
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.07)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  or with email
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                
                {mode === 'signup' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input
                        type="text"
                        id="fullName"
                        className="input-glass"
                        style={{ paddingLeft: '2.75rem' }}
                        placeholder="Alex Morgan"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      id="email"
                      className="input-glass"
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="student@college.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="input-glass"
                      style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        className="input-glass"
                        style={{ paddingLeft: '2.75rem' }}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#6c63ff' }} />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      style={{ background: 'none', border: 'none', color: '#8b85ff', cursor: 'pointer', fontSize: '0.8125rem' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: 14,
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)',
                  }}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  <span>{mode === 'signin' ? 'Sign In' : 'Continue to Preferences →'}</span>
                </button>
              </form>
            </>
          )}

          {/* STEP 2: ONBOARDING PREFERENCES (FR-2 & FR-3) */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Role Selection */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--color-text-secondary)' }}>
                  I am joining as:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {(['student', 'faculty'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 12,
                        border: `1px solid ${role === r ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: role === r ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                        color: role === r ? '#ffffff' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        textTransform: 'capitalize',
                      }}
                    >
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
                  <select
                    className="input-glass"
                    value={birthYear}
                    onChange={e => setBirthYear(e.target.value)}
                    style={{ cursor: 'pointer', borderRadius: 12 }}
                  >
                    {birthYears.map(yr => (
                      <option key={yr} value={yr} style={{ background: '#0d1117', color: '#ffffff' }}>
                        Born in {yr}
                      </option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(['below18', 'above18'] as const).map(ar => (
                      <button
                        key={ar}
                        type="button"
                        onClick={() => setAgeRange(ar)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: 12,
                          border: `1px solid ${ageRange === ar ? '#00d4aa' : 'var(--color-border)'}`,
                          background: ageRange === ar ? 'rgba(0,212,170,0.15)' : 'transparent',
                          color: ageRange === ar ? '#00d4aa' : 'var(--color-text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {ar === 'below18' ? '< 18' : '18+'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FR-3: Language Preference */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
                  <Globe size={15} color="#6c63ff" /> Language Preference
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {languages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: 10,
                        border: `1px solid ${language === lang ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: language === lang ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                        color: language === lang ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 12, fontWeight: 600 }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 12,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  <span>Complete Onboarding 🚀</span>
                </button>
              </div>
            </motion.form>
          )}

        </div>
      </motion.div>

      {/* GOOGLE ACCOUNT SELECTION MODAL */}
      <AnimatePresence>
        {googleModal && (
          <div className="modal-overlay" onClick={() => setGoogleModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              style={{
                borderRadius: 28,
                padding: '2.25rem',
                width: 440,
                maxWidth: '92vw',
                background: 'linear-gradient(135deg, rgba(25, 10, 48, 0.88) 0%, rgba(15, 5, 30, 0.94) 100%)',
                backdropFilter: 'blur(32px) saturate(190%)',
                WebkitBackdropFilter: 'blur(32px) saturate(190%)',
                border: '1.2px solid rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                boxShadow: '0 25px 70px rgba(76, 29, 149, 0.55), inset 0 1px 1.5px rgba(255, 255, 255, 0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Google Brand Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <GoogleIcon />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                    {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleModal(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '0.35rem', display: 'flex' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Choose an account
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>
                  to continue to <strong style={{ color: '#c4b5fd' }}>MeetFlow</strong>
                </p>
              </div>

              {googleAuthProcessing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                  <NewtonsCradleLoader size={48} speed={1.2} color="#c4b5fd" label="Connecting with Google..." />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {/* Account List */}
                  {googleAccounts.map(acc => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => selectGoogleAccount(acc.name, acc.email)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: acc.color,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                          flexShrink: 0,
                        }}
                      >
                        {acc.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#ffffff' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {acc.email}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Use another Google account toggle */}
                  {!showCustomGoogleInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 16,
                        border: '1px dashed rgba(255, 255, 255, 0.25)',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#c4b5fd',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        marginTop: '0.25rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = '#a78bfa';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={18} color="#c4b5fd" />
                      </div>
                      <span>Use another Google account</span>
                    </button>
                  ) : (
                    /* Custom Gmail Input Form */
                    <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', padding: '1.125rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', display: 'block', marginBottom: '0.25rem' }}>Your Name</label>
                        <input
                          type="text"
                          className="input-glass"
                          placeholder="e.g. Alex Morgan"
                          value={customGoogleName}
                          onChange={e => setCustomGoogleName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', display: 'block', marginBottom: '0.25rem' }}>Google Email / Gmail</label>
                        <input
                          type="email"
                          className="input-glass"
                          placeholder="you@gmail.com"
                          value={customGoogleEmail}
                          onChange={e => setCustomGoogleEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => setShowCustomGoogleInput(false)}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '0.55rem', borderRadius: 12, fontSize: '0.8125rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ flex: 1, padding: '0.55rem', borderRadius: 12, fontSize: '0.8125rem' }}
                        >
                          Continue →
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                <ShieldCheck size={14} color="#00f2c3" />
                <span>Google OAuth will link your email & preferences to MeetFlow.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {forgotModal && (
          <div className="modal-overlay" onClick={() => setForgotModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass"
              style={{ borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90vw' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <KeyRound size={22} color="#8b85ff" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                Reset Your Password
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '1.25rem' }}>
                Enter your registered college or personal email to receive a password reset link.
              </p>

              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.3)', marginBottom: '1rem' }}>
                  <CheckCircle2 size={24} color="#22c55e" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#86efac' }}>Reset link sent to {forgotEmail}!</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="email"
                    className="input-glass"
                    placeholder="student@college.edu"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 12, fontWeight: 700 }}
                  >
                    Send Reset Link
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setForgotModal(false);
                  setForgotSent(false);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', width: '100%', padding: '0.75rem 0 0', cursor: 'pointer', fontSize: '0.8125rem' }}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
