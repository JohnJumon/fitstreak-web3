"use client";

import { FormEvent, useState } from "react";

type Props = {
  walletAddress: string;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export default function NewLogModal({ walletAddress, onClose, onCreated }: Props) {
  const [workoutType, setWorkoutType] = useState("Strength");
  const [durationMin, setDurationMin] = useState(30);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  async function submitLog(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          workoutType,
          durationMin,
          notes
        })
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Could not save workout");
      }

      await onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/15 bg-[#111111] p-4 text-white shadow-2xl sm:p-5">
        <h2 className="text-xl font-semibold">Add Workout Log</h2>
        <form onSubmit={submitLog} className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm text-white/80">
            Workout type
            <input
              required
              value={workoutType}
              onChange={(event) => setWorkoutType(event.target.value)}
              placeholder="Cardio, Strength, Yoga..."
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none transition focus:border-[#007bff]"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            Duration (minutes)
            <input
              required
              type="number"
              min={1}
              value={durationMin}
              onChange={(event) => setDurationMin(Number(event.target.value))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none transition focus:border-[#007bff]"
            />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            Notes
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="How did today's workout feel?"
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none transition focus:border-[#007bff]"
            />
          </label>

          <div className="mt-1 grid grid-cols-1 gap-3 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/50 sm:min-w-[100px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8bff] sm:min-w-[120px]"
            >
              {saving ? "Saving..." : "Save Log"}
            </button>
          </div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
