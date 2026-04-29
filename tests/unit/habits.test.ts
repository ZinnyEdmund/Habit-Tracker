import { describe, expect, it } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

const baseHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2026-04-27T00:00:00.000Z',
  completions: [],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    expect(toggleHabitCompletion(baseHabit, '2026-04-27').completions).toEqual(['2026-04-27']);
  });

  it('removes a completion date when the date already exists', () => {
    const updatedHabit = toggleHabitCompletion(
      {
        ...baseHabit,
        completions: ['2026-04-27'],
      },
      '2026-04-27',
    );

    expect(updatedHabit.completions).toEqual([]);
  });

  it('does not mutate the original habit object', () => {
    const originalHabit: Habit = {
      ...baseHabit,
      completions: ['2026-04-26'],
    };

    const nextHabit = toggleHabitCompletion(originalHabit, '2026-04-27');

    expect(originalHabit.completions).toEqual(['2026-04-26']);
    expect(nextHabit).not.toBe(originalHabit);
  });

  it('does not return duplicate completion dates', () => {
    const updatedHabit = toggleHabitCompletion(
      {
        ...baseHabit,
        completions: ['2026-04-26', '2026-04-26'],
      },
      '2026-04-27',
    );

    expect(updatedHabit.completions).toEqual(['2026-04-26', '2026-04-27']);
  });
});
