"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import AppNav from "@/components/AppNav";
import MintBadgeButton from "@/components/MintBadgeButton";
import NewLogModal from "@/components/NewLogModal";
import { badgeAbi } from "@/lib/contract";
import { StreakResponse, WorkoutLog } from "@/lib/types";
import { getStoredWallet } from "@/lib/walletSession";

export default function LogPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [streakDays, setStreakDays] = useState(0);
  const [eligibleMilestone, setEligibleMilestone] = useState<number | null>(null);
  const [showMintReminder, setShowMintReminder] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_BADGE_CONTRACT as `0x${string}` | undefined;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  const loadAll = useCallback(async (wallet: string) => {
    const [streakRes, logsRes] = await Promise.all([
      fetch(`/api/streak?wallet=${wallet}`),
      fetch(`/api/workouts?wallet=${wallet}`)
    ]);

    if (!streakRes.ok || !logsRes.ok) {
      throw new Error("Could not load workout data");
    }

    const streakBody = (await streakRes.json()) as StreakResponse;
    const logsBody = (await logsRes.json()) as { workouts: WorkoutLog[] };
    setStreakDays(streakBody.streakDays);
    setEligibleMilestone(streakBody.eligibleMilestone);
    setWorkouts(logsBody.workouts);

    if (!streakBody.eligibleMilestone || !contractAddress || !rpcUrl) {
      setShowMintReminder(false);
      return;
    }

    try {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl)
      });

      const alreadyMinted = (await publicClient.readContract({
        address: contractAddress,
        abi: badgeAbi,
        functionName: "hasMintedMilestone",
        args: [wallet as `0x${string}`, BigInt(streakBody.eligibleMilestone)]
      })) as boolean;

      setShowMintReminder(!alreadyMinted);
    } catch {
      // If chain lookup fails, keep reminder visible so user can still try mint flow.
      setShowMintReminder(true);
    }
  }, [contractAddress, rpcUrl]);

  useEffect(() => {
    const wallet = getStoredWallet();
    if (!wallet) {
      setStatus("No wallet connected. Connect wallet on landing page.");
      return;
    }
    setWalletAddress(wallet);
    loadAll(wallet)
      .then(() => setStatus("Ready"))
      .catch((err) => setStatus(err instanceof Error ? err.message : "Could not load workout data"));
  }, [loadAll]);

  async function reloadData() {
    if (!walletAddress) {
      return;
    }
    await loadAll(walletAddress);
  }

  function scrollToMint() {
    const section = document.getElementById("mint-section");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <AppNav walletAddress={walletAddress} />
      <main className="relative min-h-screen overflow-hidden bg-[#1a1a1a] px-4 pb-14 pt-8 text-white sm:px-6 sm:pb-16 sm:pt-10">
        <div className="pointer-events-none absolute -left-20 top-6 h-56 w-56 rounded-full bg-[#007bff]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-36 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="inline-flex rounded-full border border-[#007bff]/40 bg-[#007bff]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8ec3ff]">
            Progress Dashboard
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">Workout Logs</h1>
          <p className="mt-2 text-white/70">
            Track your progress day by day and keep your streak alive.
          </p>

          {!walletAddress ? (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-white/70">{status}</p>
              <Link
                href="/"
                className="mt-3 inline-block rounded-xl bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8bff]"
              >
                Go to Landing
              </Link>
            </section>
          ) : (
            <>
              <section className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/50">Current Streak</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#007bff]">{streakDays} days</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/50">Unlocked Milestone</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#007bff]">
                    {eligibleMilestone ? `${eligibleMilestone} days` : "None yet"}
                  </p>
                </div>
              </section>

              <section id="mint-section" className="mt-5">
                <MintBadgeButton
                  walletAddress={walletAddress}
                  milestone={eligibleMilestone}
                  onMinted={reloadData}
                />
              </section>

              <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Workout Notes</h2>
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8bff]"
                  >
                    Add New Log
                  </button>
                </div>

                {workouts.length === 0 ? (
                  <p className="mt-4 text-sm text-white/70">No notes yet. Add your first workout log.</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {workouts.map((log) => (
                      <article
                        key={log.id}
                        className="min-h-[180px] rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] sm:aspect-square"
                      >
                        <div className="flex h-full flex-col">
                          <p className="text-sm font-semibold text-[#8ec3ff]">{log.workoutDate}</p>
                          <p className="mt-2 text-sm">
                            <span className="font-semibold">{log.workoutType}</span> for{" "}
                            <span className="font-semibold">{log.durationMin} min</span>
                          </p>
                          <p className="mt-3 overflow-hidden text-sm leading-relaxed text-white/70 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6]">
                            {log.notes || "No notes for this day."}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {showModal ? (
            <NewLogModal
              walletAddress={walletAddress}
              onClose={() => setShowModal(false)}
              onCreated={reloadData}
            />
          ) : null}

          {walletAddress && eligibleMilestone && showMintReminder ? (
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
              <div className="pointer-events-auto mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border border-[#007bff]/40 bg-[#0f172a]/90 px-4 py-3 shadow-[0_10px_30px_rgba(0,123,255,0.25)] backdrop-blur">
                <p className="text-sm text-white/85">
                  Milestone unlocked: <span className="font-semibold text-[#8ec3ff]">{eligibleMilestone} days</span>
                </p>
                <button
                  onClick={scrollToMint}
                  className="shrink-0 rounded-xl bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8bff]"
                >
                  Mint Badge
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
