"use client";

import { FormEvent, useState } from "react";

type Props = {
  walletAddress: string;
  onLogged: () => Promise<void>;
};

export default function WorkoutForm({ walletAddress, onLogged }: Props) {
  const [workoutType, setWorkoutType] = useState("Strength");
  const [durationMin, setDurationMin] = useState(30);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          workoutType,
          durationMin: Number(durationMin),
          notes
        })
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to log workout");
      }

      setNotes("");
      await onLogged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Log Workout</h2>
      <form onSubmit={onSubmit}>
        <div className="row">
          <label>
            Workout type
            <input
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              placeholder="Cardio, Strength, Yoga..."
              required
            />
          </label>
          <label>
            Duration (minutes)
            <input
              type="number"
              min={1}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              required
            />
          </label>
        </div>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="How did it go?"
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Saving..." : "Save Workout"}
        </button>
        {error ? <p className="small">{error}</p> : null}
      </form>
    </section>
  );
}
