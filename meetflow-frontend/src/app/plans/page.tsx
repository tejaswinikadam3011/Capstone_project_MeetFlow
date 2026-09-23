'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check, Star, Zap, Brain, Users, Shield, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Student',
    price: 'Free',
    period: 'forever',
    color: 'var(--color-teal)',
    glow: 'rgba(0,212,170,0.15)',
    border: 'rgba(0,212,170,0.3)',
    icon: Users,
    features: [
      'Join unlimited meetings',
      'Access summaries & recordings',
      'AI Q&A assistant (10 queries/day)',
      'Personal task dashboard',
      'Archive (last 30 days)',
    ],
    cta: 'Current Plan',
    current: true,
  },
  {
    name: 'Faculty Pro',
    price: '₹299',
    period: '/month',
    color: 'var(--color-accent)',
    glow: 'rgba(108,99,255,0.2)',
    border: 'rgba(108,99,255,0.5)',
    icon: Star,
    badge: 'Most Popular',
    features: [
      'Host unlimited meetings',
      'AI Summarizer (unlimited)',
      'Task Agent auto-detection',
      'Reminder Agent',
      'Doubt Log dashboard',
      'Export PDF summaries',
      'Archive (unlimited)',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    current: false,
  },
  {
    name: 'Institution',
    price: '₹4,999',
    period: '/month',
    color: '#f72585',
    glow: 'rgba(247,37,133,0.15)',
    border: 'rgba(247,37,133,0.3)',
    icon: Shield,
    features: [
      'Everything in Faculty Pro',
      'Unlimited hosts & admins',
      'Domain-restricted rooms',
      'SSO / SAML integration',
      'Custom branding',
      'Analytics dashboard',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    current: false,
  },
];

const faqs = [
  { q: 'Can a student also be a host?', a: 'Yes! Any user can host meetings (e.g., for club meetings) while also being a participant in faculty-led classes. Role is determined per-meeting.' },
  { q: 'Is payment processing live?', a: 'Plans & Pricing is a placeholder in this version. Billing is out of scope for v1.0 per the PRD.' },
  { q: 'Can I try Faculty Pro for free?', a: 'Yes — every new host gets a 30-day free trial of Faculty Pro with no credit card required.' },
];

export default function PlansPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <motion.div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', top: '0%', right: '10%', pointerEvents: 'none' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '0.25rem 0.875rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 700 }}>⚠️ PLACEHOLDER — Out of scope for v1.0</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Plans & Pricing</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Choose the plan that fits your role</p>
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ position: 'relative', background: plan.glow, border: `1px solid ${plan.border}`, borderRadius: 20, padding: '2rem', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(20px)' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-accent)', color: 'white', borderRadius: 999, padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${plan.color}40` }}>
                    <Icon size={20} color={plan.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem', fontFamily: "'Space Grotesk',sans-serif" }}>{plan.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: plan.color, fontFamily: "'Space Grotesk',sans-serif" }}>{plan.price}</span>
                      {plan.period}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      <Check size={14} color={plan.color} style={{ marginTop: 2, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  style={{ width: '100%', padding: '0.875rem', borderRadius: 12, border: plan.current ? `1px solid ${plan.color}` : 'none', background: plan.current ? 'transparent' : plan.color, color: plan.current ? plan.color : plan.name === 'Faculty Pro' ? 'white' : '#080b14', fontWeight: 700, fontSize: '0.9375rem', cursor: plan.current ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                  onMouseEnter={e => !plan.current && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => !plan.current && (e.currentTarget.style.opacity = '1')}
                >
                  {plan.cta} {!plan.current && <ArrowRight size={15} />}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <motion.div key={i} className="glass" style={{ borderRadius: 14, padding: '1.25rem', marginBottom: '0.875rem' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Q: {faq.q}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{faq.a}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
