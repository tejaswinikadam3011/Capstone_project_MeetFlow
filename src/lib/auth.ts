/**
 * MeetFlow Auth Helper
 * Provides a unified auth API that works in two modes:
 *   1. Demo mode (no .env keys) — stores user in localStorage
 *   2. Supabase mode (keys present) — real session via Supabase Auth
 *
 * NOTE: This is a pure utility — no 'use client' directive needed.
 * localStorage guards (typeof window !== 'undefined') handle SSR safety.
 */

export type MeetFlowUser = {
  name: string;
  email: string;
  role: 'student' | 'faculty';
  language: string;
  birthYear?: string;
  ageRange?: 'below18' | 'above18';
  isLoggedIn: boolean;
  authProvider?: 'email' | 'google';
  avatarUrl?: string;
};

const STORAGE_KEY = 'meetflow_user';

/** Read the currently authenticated user from localStorage (demo mode). */
export function getLocalUser(): MeetFlowUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MeetFlowUser;
    return parsed?.isLoggedIn ? parsed : null;
  } catch {
    return null;
  }
}

/** Persist a user to localStorage (demo mode). */
export function setLocalUser(user: MeetFlowUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, isLoggedIn: true }));
}

/** Clear the current session from localStorage. */
export function clearLocalUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Derive initials for avatar fallback from a display name. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
