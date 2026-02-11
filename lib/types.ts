export type WorkoutInput = {
  walletAddress: string;
  workoutType: string;
  durationMin: number;
  notes?: string;
};

export type WorkoutLog = {
  id: string;
  walletAddress: string;
  workoutType: string;
  durationMin: number;
  notes: string;
  workoutDate: string;
  createdAt: string;
};

export type StreakResponse = {
  streakDays: number;
  eligibleMilestone: number | null;
};
