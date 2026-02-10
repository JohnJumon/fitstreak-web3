"use client";

import { useCallback, useEffect, useState } from "react";
import WorkoutForm from "@/components/WorkoutForm";
import StreakCard from "@/components/StreakCard";
import MintBadgeButton from "@/components/MintBadgeButton";
import { StreakResponse } from "@/lib/types";
import { getMetaMaskProvider } from "@/lib/provider";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [streakDays, setStreakDays] = useState(0);
  const [eligibleMilestone, setEligibleMilestone] = useState<number | null>(null);
  const [status, setStatus] = useState("Wallet not connected");

  const loadStreak = useCallback(async () => {
    if (!walletAddress) return;
    const res = await fetch(`/api/streak?wallet=${walletAddress}`);
    if (!res.ok) {
      setStatus("Could not load streak");
      return;
    }

    const data = (await res.json()) as StreakResponse;
    setStreakDays(data.streakDays);
    setEligibleMilestone(data.eligibleMilestone);
  }, [walletAddress]);

  useEffect(() => {
    loadStreak().catch(() => {
      setStatus("Could not load streak");
    });
  }, [loadStreak]);

  async function connectWallet() {
    try {
      const provider = getMetaMaskProvider();
      if (!provider) {
        setStatus("MetaMask provider not found. Disable other wallet extensions and retry.");
        return;
      }

      const result = (await provider.request({
        method: "eth_requestAccounts"
      })) as string[];

      if (result[0]) {
        setWalletAddress(result[0]);
        setStatus(`Connected: ${result[0]}`);
        setStreakDays(0);
        setEligibleMilestone(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet request failed";
      setStatus(message);
      // Keep raw error in console for wallet-specific troubleshooting.
      // eslint-disable-next-line no-console
      console.error("wallet connect error", err);
    }
  }

  return (
    <main>
      <h1>Workout Streak + Badge Minting</h1>
      <p className="subtitle">Log your workout, keep your streak, mint milestone NFT badges.</p>

      <section className="card">
        <h2>Wallet</h2>
        <button onClick={connectWallet}>
          {walletAddress ? "Reconnect Wallet" : "Connect MetaMask"}
        </button>
        <p className="small">{status}</p>
      </section>

      {walletAddress ? (
        <>
          <WorkoutForm walletAddress={walletAddress} onLogged={loadStreak} />
          <StreakCard streakDays={streakDays} eligibleMilestone={eligibleMilestone} />
          <MintBadgeButton walletAddress={walletAddress} milestone={eligibleMilestone} />
        </>
      ) : null}
    </main>
  );
}
