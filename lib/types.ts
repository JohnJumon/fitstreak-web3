export type WorkoutInput = {
  walletAddress: string;
  workoutType: string;
  durationMin: number;
  notes?: string;
};

export type WorkoutLog = WorkoutInput & {
  id: string;
  workoutDate: string;
  createdAt: string;
};

export type StreakResponse = {
  streakDays: number;
  eligibleMilestone: number | null;
};
