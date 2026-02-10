export const STREAK_MILESTONES = [3, 7, 14, 30] as const;

export function getEligibleMilestone(streakDays: number): number | null {
  const unlocked = STREAK_MILESTONES.filter((m) => streakDays >= m);
  if (unlocked.length === 0) {
    return null;
  }
  return unlocked[unlocked.length - 1];
}
