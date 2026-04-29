import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardClient } from '@/components/habits/DashboardClient';
import { STORAGE_KEYS } from '@/data/storage';
import type { Habit } from '@/types/habit';
import type { User } from '@/types/auth';

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

function seedDashboard(habits: Habit[] = []) {
  const user: User = {
    id: 'user-1',
    email: 'person@example.com',
    password: 'secret123',
    createdAt: '2026-04-27T00:00:00.000Z',
  };

  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([user]));
  localStorage.setItem(
    STORAGE_KEYS.session,
    JSON.stringify({
      userId: user.id,
      email: user.email,
    }),
  );
  localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
}

describe('habit form', () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    seedDashboard();

    render(<DashboardClient />);

    await screen.findByTestId('dashboard-page');
    await user.click(screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByText('Habit name is required')).toBeInTheDocument();
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    seedDashboard();

    render(<DashboardClient />);

    await screen.findByTestId('dashboard-page');
    await user.click(screen.getByTestId('create-habit-button'));
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Finish two bottles.');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByTestId('habit-card-drink-water')).toBeInTheDocument();

    const storedHabits = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? '[]');
    expect(storedHabits).toHaveLength(1);
    expect(storedHabits[0]).toMatchObject({
      userId: 'user-1',
      name: 'Drink Water',
      description: 'Finish two bottles.',
      frequency: 'daily',
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    const existingHabit: Habit = {
      id: 'habit-1',
      userId: 'user-1',
      name: 'Read Books',
      description: 'Ten pages before bed.',
      frequency: 'daily',
      createdAt: '2026-04-27T00:00:00.000Z',
      completions: ['2026-04-26'],
    };

    seedDashboard([existingHabit]);

    render(<DashboardClient />);

    await screen.findByTestId('dashboard-page');
    await user.click(screen.getByTestId('habit-edit-read-books'));
    await user.clear(screen.getByTestId('habit-name-input'));
    await user.type(screen.getByTestId('habit-name-input'), 'Morning Reading');
    await user.clear(screen.getByTestId('habit-description-input'));
    await user.type(screen.getByTestId('habit-description-input'), 'Read with breakfast.');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByTestId('habit-card-morning-reading')).toBeInTheDocument();

    const storedHabit = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? '[]')[0];
    expect(storedHabit).toMatchObject({
      id: 'habit-1',
      userId: 'user-1',
      createdAt: '2026-04-27T00:00:00.000Z',
      completions: ['2026-04-26'],
      name: 'Morning Reading',
      description: 'Read with breakfast.',
      frequency: 'daily',
    });
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    const existingHabit: Habit = {
      id: 'habit-1',
      userId: 'user-1',
      name: 'Stretch',
      description: 'Five minutes after waking up.',
      frequency: 'daily',
      createdAt: '2026-04-27T00:00:00.000Z',
      completions: [],
    };

    seedDashboard([existingHabit]);

    render(<DashboardClient />);

    await screen.findByTestId('dashboard-page');
    await user.click(screen.getByTestId('habit-delete-stretch'));

    expect(screen.getByTestId('habit-card-stretch')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? '[]')).toHaveLength(1);

    await user.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? '[]')).toEqual([]);
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    const today = getDateKey(new Date());
    const yesterday = addDays(today, -1);
    const existingHabit: Habit = {
      id: 'habit-1',
      userId: 'user-1',
      name: 'Walk',
      description: 'Take an evening walk.',
      frequency: 'daily',
      createdAt: '2026-04-27T00:00:00.000Z',
      completions: [yesterday],
    };

    seedDashboard([existingHabit]);

    render(<DashboardClient />);

    await screen.findByTestId('dashboard-page');
    expect(screen.getByTestId('habit-streak-walk')).toHaveTextContent('Current streak: 0');

    await user.click(screen.getByTestId('habit-complete-walk'));

    await waitFor(() => {
      expect(screen.getByTestId('habit-streak-walk')).toHaveTextContent('Current streak: 2');
    });

    const storedHabit = JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? '[]')[0];
    expect(storedHabit.completions.sort()).toEqual([today, yesterday].sort());
  });
});
