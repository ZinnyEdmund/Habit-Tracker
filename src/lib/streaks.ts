function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function shiftDate(dateKey: string, offsetDays: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  return getDateKey(date);
}

export function calculateCurrentStreak(
  completions: string[],
  today = getDateKey(new Date()),
): number {
  const uniqueDates = [...new Set(completions)].sort();

  if (!uniqueDates.includes(today)) {
    return 0;
  }

  const completionSet = new Set(uniqueDates);
  let streak = 0;
  let cursor = today;

  while (completionSet.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}
