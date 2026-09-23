'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, MessageSquare, Folder, BarChart3, Settings } from 'lucide-react';

export default function GlassNavbar() {
  const pathname = usePathname();

  // Hide navbar on landing page (page.tsx) and live video calls if preferred
  if (pathname === '/' || pathname.startsWith('/meeting/')) {
    return null;
  }

  const navItems = [
    {
      id: 'ai',
      label: 'AI Assistant',
      href: '/qa',
      icon: Sparkles,
      active: pathname === '/qa',
    },
    {
      id: 'calendar',
      label: 'Meetings & Schedule',
      href: '/dashboard',
      icon: Calendar,
      active: pathname === '/dashboard' || pathname === '/meeting/create' || pathname === '/meeting/join',
    },
    {
      id: 'chat',
      label: 'Live Q&A Discussions',
      href: '/qa',
      icon: MessageSquare,
      active: pathname === '/qa',
    },
    {
      id: 'archive',
      label: 'Summaries & Archive',
      href: '/archive',
      icon: Folder,
      active: pathname === '/archive' || pathname.startsWith('/summary/'),
    },
    {
      id: 'tasks',
      label: 'Tasks & Analytics',
      href: '/tasks',
      icon: BarChart3,
      active: pathname === '/tasks' || pathname === '/plans',
    },
    {
      id: 'settings',
      label: 'Settings & Profile',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <>
      {/* Desktop Floating Left Capsule Pill Dock */}
      <aside
        className="hidden md:flex"
        style={{
          position: 'fixed',
          left: '1.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 45,
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {/* Outer Frosted Glass Capsule */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 0.65rem',
            borderRadius: '9999px',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
            backdropFilter: 'blur(36px) saturate(200%)',
            WebkitBackdropFilter: 'blur(36px) saturate(200%)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            boxShadow:
              '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(124, 58, 237, 0.35), inset 0 1.5px 2px rgba(255, 255, 255, 0.45)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <div key={item.id} style={{ position: 'relative' }} className="group">
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    textDecoration: 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#0f051d' : 'rgba(255, 255, 255, 0.75)',
                    boxShadow: isActive
                      ? '0 6px 20px rgba(255, 255, 255, 0.45), 0 0 15px rgba(255, 255, 255, 0.3)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.9} />
                </Link>

                {/* Floating Tooltip Label on Hover */}
                <div
                  style={{
                    position: 'absolute',
                    left: '120%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    opacity: 0,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    zIndex: 50,
                  }}
                  className="group-hover:opacity-100 group-hover:translate-x-2"
                >
                  <div
                    style={{
                      background: 'rgba(19, 7, 38, 0.92)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.3)',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile Floating Bottom Glass Dock */}
      <nav
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 45,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.9rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            border: '1.5px solid rgba(255, 255, 255, 0.28)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.id}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  textDecoration: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f051d' : 'rgba(255, 255, 255, 0.75)',
                  boxShadow: isActive ? '0 4px 15px rgba(255, 255, 255, 0.4)' : 'none',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
