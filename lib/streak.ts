function toIsoDateOnly(value: string | Date): string {
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
}

export function calculateStreakFromDates(dates: Array<string | Date>): number {
  if (dates.length === 0) {
    return 0;
  }

  const unique = [...new Set(dates.map((d) => toIsoDateOnly(d)))].sort();
  const lastLogged = unique[unique.length - 1];
  const today = new Date();
  const todayIso = toIsoDateOnly(today);
  const yesterdayIso = toIsoDateOnly(new Date(today.getTime() - 86400000));

  // If the user has missed more than one day, the active streak is broken.
  if (lastLogged !== todayIso && lastLogged !== yesterdayIso) {
    return 0;
  }

  let streak = 1;

  for (let i = 1; i < unique.length; i += 1) {
    const prev = new Date(`${unique[i - 1]}T00:00:00.000Z`);
    const current = new Date(`${unique[i]}T00:00:00.000Z`);
    const diffDays = (current.getTime() - prev.getTime()) / 86400000;

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  return streak;
}
