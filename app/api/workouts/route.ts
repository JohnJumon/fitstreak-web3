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

    return NextResponse.json({ workout: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
