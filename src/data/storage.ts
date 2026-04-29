import type { Session, User } from '@/types/auth';
import type { Habit } from '@/types/habit';

export const STORAGE_KEYS = {
  users: 'habit-tracker-users',
  session: 'habit-tracker-session',
  habits: 'habit-tracker-habits',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.password === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.userId === 'string' && typeof candidate.email === 'string';
}

function isHabit(value: unknown): value is Habit {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.userId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.description === 'string' &&
    candidate.frequency === 'daily' &&
    typeof candidate.createdAt === 'string' &&
    Array.isArray(candidate.completions) &&
    candidate.completions.every((entry) => typeof entry === 'string')
  );
}

function readJsonValue(key: string): unknown {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function writeJsonValue(key: string, value: unknown): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): User[] {
  const parsed = readJsonValue(STORAGE_KEYS.users);
  return Array.isArray(parsed) ? parsed.filter(isUser) : [];
}

export function saveUsers(users: User[]): void {
  writeJsonValue(STORAGE_KEYS.users, users);
}

export function getHabits(): Habit[] {
  const parsed = readJsonValue(STORAGE_KEYS.habits);
  return Array.isArray(parsed) ? parsed.filter(isHabit) : [];
}

export function saveHabits(habits: Habit[]): void {
  writeJsonValue(STORAGE_KEYS.habits, habits);
}

export function getSession(): Session | null {
  const parsed = readJsonValue(STORAGE_KEYS.session);
  return isSession(parsed) ? parsed : null;
}

export function getValidSession(): Session | null {
  const session = getSession();

  if (!session) {
    return null;
  }

  const matchingUser = getUsers().find(
    (user) => user.id === session.userId && user.email === session.email,
  );

  return matchingUser ? session : null;
}

export function saveSession(session: Session): void {
  writeJsonValue(STORAGE_KEYS.session, session);
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.session);
}