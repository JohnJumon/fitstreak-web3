import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { WorkoutInput } from "@/lib/types";

function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isValidBody(body: Partial<WorkoutInput>): body is WorkoutInput {
  return (
    typeof body.walletAddress === "string" &&
    isValidAddress(body.walletAddress) &&
    typeof body.workoutType === "string" &&
    body.workoutType.trim().length > 0 &&
    typeof body.durationMin === "number" &&
    body.durationMin > 0
  );
}

function normalizeWorkout(row: {
  id: string;
  wallet_address: string;
  workout_type: string;
  duration_min: number;
  notes: string | null;
  workout_date: string;
  created_at: string;
}) {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    workoutType: row.workout_type,
    durationMin: row.duration_min,
    notes: row.notes ?? "",
    workoutDate: row.workout_date,
    createdAt: row.created_at
  };
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet || !isValidAddress(wallet)) {
    return NextResponse.json({ error: "Valid wallet query param required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("workout_logs")
    .select("id, wallet_address, workout_type, duration_min, notes, workout_date, created_at")
    .eq("wallet_address", wallet.toLowerCase())
    .order("workout_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workouts = (data ?? []).map(normalizeWorkout);
  return NextResponse.json({ workouts }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<WorkoutInput>;
    if (!isValidBody(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const workoutDate = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseAdmin
      .from("workout_logs")
      .insert({
        wallet_address: body.walletAddress.toLowerCase(),
        workout_type: body.workoutType.trim(),
        duration_min: body.durationMin,
        notes: body.notes?.trim() ?? "",
        workout_date: workoutDate
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workout: normalizeWorkout(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
