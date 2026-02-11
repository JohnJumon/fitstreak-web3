"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { STREAK_MILESTONES } from "@/lib/milestones";
import { StreakResponse } from "@/lib/types";
import { getStoredWallet } from "@/lib/walletSession";

export default function ProfilePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [streakDays, setStreakDays] = useState(0);
  const [status, setStatus] = useState("Loading...");

  const loadProfile = useCallback(async (wallet: string) => {
    const response = await fetch(`/api/streak?wallet=${wallet}`);
    if (!response.ok) {
      throw new Error("Could not load profile data");
    }
    const body = (await response.json()) as StreakResponse;
    setStreakDays(body.streakDays);
  }, []);

  useEffect(() => {
    const wallet = getStoredWallet();
    if (!wallet) {
      setStatus("No wallet connected. Connect wallet on landing page.");
      return;
    }
    setWalletAddress(wallet);
    loadProfile(wallet)
      .then(() => setStatus("Ready"))
      .catch((err) => setStatus(err instanceof Error ? err.message : "Could not load profile data"));
  }, [loadProfile]);

  useEffect(() => {
    function onMinted() {
      const wallet = getStoredWallet();
      if (!wallet) {
        return;
      }
      loadProfile(wallet).catch(() => {
        setStatus("Could not refresh profile data");
      });
    }

    window.addEventListener("fitstreak-badge-minted", onMinted);
    return () => window.removeEventListener("fitstreak-badge-minted", onMinted);
  }, [loadProfile]);

  return (
    <>
      <AppNav walletAddress={walletAddress} />
      <main className="relative min-h-screen overflow-hidden bg-[#1a1a1a] px-4 pb-14 pt-8 text-white sm:px-6 sm:pb-16 sm:pt-10">
        <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#007bff]/15 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 h-52 w-52 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="inline-flex rounded-full border border-[#007bff]/40 bg-[#007bff]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8ec3ff]">
            Wallet Profile
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">Profile</h1>
          <p className="mt-2 text-white/70">Wallet details and badge milestones.</p>

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
              <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <h2 className="text-xl font-semibold">Wallet Address</h2>
                <p className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/25 px-3 py-2 font-mono text-sm text-white/90">
                  {walletAddress}
                </p>
                <p className="mt-3 text-sm text-white/70">Current streak: {streakDays} days</p>
              </section>

              <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-xl font-semibold">Unlockable Badges</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {STREAK_MILESTONES.map((milestone) => {
                    const unlocked = streakDays >= milestone;
                    return (
                      <article
                        key={milestone}
                        className={`rounded-2xl border p-4 ${
                          unlocked
                            ? "border-[#12b76a]/50 bg-[#12b76a]/10"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        <p className="text-base font-semibold">{milestone}-Day Badge</p>
                        <p className={`mt-1 text-sm ${unlocked ? "text-[#6ce9a6]" : "text-white/65"}`}>
                          {unlocked ? "Unlocked" : "Locked"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
