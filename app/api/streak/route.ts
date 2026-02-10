import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateStreakFromDates } from "@/lib/streak";
import { getEligibleMilestone } from "@/lib/milestones";

function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet || !isValidAddress(wallet)) {
    return NextResponse.json({ error: "Valid wallet query param required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("workout_logs")
    .select("workout_date")
    .eq("wallet_address", wallet.toLowerCase())
    .order("workout_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dates = (data ?? []).map((row) => row.workout_date as string);
  const streakDays = calculateStreakFromDates(dates);
  const eligibleMilestone = getEligibleMilestone(streakDays);

  return NextResponse.json({
    streakDays,
    eligibleMilestone
  });
}
