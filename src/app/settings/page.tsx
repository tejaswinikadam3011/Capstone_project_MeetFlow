'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, User, Globe, Moon, Sun, Shield, Bell, LogOut, Camera, Save } from 'lucide-react';

const languages = ['English', 'Hindi', 'French', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali'];
const timezones = ['Asia/Kolkata (IST)', 'America/New_York (EST)', 'Europe/London (GMT)', 'Asia/Singapore (SGT)'];

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [notifications, setNotifications] = useState({ reminders: true, tasks: true, summaries: true, doNotDisturb: false });
  const [displayName, setDisplayName] = useState('Tejaswini Kadam');
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'notifications'>('profile');
  const [saved, setSaved] = useState(false);
  const [e2e, setE2e] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [domainRestrict, setDomainRestrict] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange, id }: { value: boolean; onChange: (v: boolean) => void; id: string }) => (
    <button id={id} onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'background 0.25s', background: value ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s' }} />
    </button>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
          {/* Sidebar tabs */}
          <div className="glass" style={{ borderRadius: 16, padding: '0.75rem', alignSelf: 'start' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ width: '100%', marginBottom: '0.125rem', justifyContent: 'flex-start' }}>
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <button className="nav-item" style={{ width: '100%', color: 'var(--color-danger)' }}
                onClick={() => window.location.href = '/'}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="glass" style={{ borderRadius: 16, padding: '1.75rem' }}>
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Profile</h2>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>T</div>
                    <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--color-accent)', border: '2px solid var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Camera size={11} color="white" />
                    </button>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Tejaswini Kadam</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>tejaswini@college.edu</div>
                    <span className="badge badge-accent" style={{ marginTop: '0.375rem', fontSize: '0.75rem' }}>Above 18</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Display Name</label>
                    <input id="display-name" className="input-glass" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Email</label>
                    <input id="email-field" className="input-glass" value="tejaswini@college.edu" disabled style={{ opacity: 0.5 }} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Preferences</h2>

                {/* Theme — FR-58 */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Theme</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {([['dark', '🌙 Dark', Moon], ['light', '☀️ Light', Sun]] as const).map(([val, label, Icon]) => (
                      <button key={val} onClick={() => setTheme(val)}
                        style={{ flex: 1, padding: '0.875rem', borderRadius: 12, border: `1px solid ${theme === val ? 'var(--color-accent)' : 'var(--color-border)'}`, background: theme === val ? 'rgba(108,99,255,0.12)' : 'transparent', color: theme === val ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Icon size={16} /> {val.charAt(0).toUpperCase() + val.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language — FR-3 */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Language</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {languages.map(lang => (
                      <button key={lang} onClick={() => setLanguage(lang)}
                        style={{ padding: '0.625rem', borderRadius: 10, border: `1px solid ${language === lang ? 'var(--color-accent)' : 'var(--color-border)'}`, background: language === lang ? 'rgba(108,99,255,0.12)' : 'transparent', color: language === lang ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Timezone</label>
                  <select id="timezone-select" className="input-glass" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ cursor: 'pointer' }}>
                    {timezones.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Notifications</h2>

                {[
                  { id: 'notif-reminders', label: 'Meeting Reminders', desc: 'Get notified before your scheduled meetings', key: 'reminders' as const },
                  { id: 'notif-tasks', label: 'Task Deadlines', desc: 'Alerts for upcoming and overdue tasks', key: 'tasks' as const },
                  { id: 'notif-summaries', label: 'Summary Available', desc: 'When a meeting summary is approved', key: 'summaries' as const },
                  { id: 'notif-dnd', label: 'Do Not Disturb', desc: 'Silence all notifications during active meetings (FR-57)', key: 'doNotDisturb' as const },
                ].map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                    </div>
                    <Toggle id={item.id} value={notifications[item.key]} onChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Privacy & Security</h2>
                {[
                  { label: 'End-to-End Encryption', desc: 'Enable E2E encryption for sensitive meetings (FR-55)', id: 'privacy-0', value: e2e, onChange: setE2e },
                  { label: 'Session Timeout', desc: 'Auto-logout on shared devices after 30 min of inactivity (FR-56)', id: 'privacy-1', value: sessionTimeout, onChange: setSessionTimeout },
                  { label: 'Domain-Restricted Rooms', desc: 'Only allow college email domain to join your rooms (FR-54)', id: 'privacy-2', value: domainRestrict, onChange: setDomainRestrict },
                ].map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                    </div>
                    <Toggle id={item.id} value={item.value} onChange={item.onChange} />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Save */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {saved && <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>✓ Saved</span>}
              <button onClick={handleSave} className="btn-primary" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Save size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
