import type { Habit } from '@/types/habit';

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = [...new Set(habit.completions)];
  const hasDate = completions.includes(date);

  const nextCompletions = hasDate
    ? completions.filter((entry) => entry !== date)
    : [...completions, date];

  return {
    ...habit,
    completions: [...new Set(nextCompletions)],
  };
}
