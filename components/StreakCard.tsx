type Props = {
  streakDays: number;
  eligibleMilestone: number | null;
};

export default function StreakCard({ streakDays, eligibleMilestone }: Props) {
  return (
    <section className="card">
      <h2>Your Streak</h2>
      <p>
        Current streak: <strong>{streakDays}</strong> day{streakDays === 1 ? "" : "s"}
      </p>
      <p className="small">
        {eligibleMilestone
          ? `Milestone unlocked: ${eligibleMilestone} days`
          : "No milestone unlocked yet. Keep going."}
      </p>
    </section>
  );
}
