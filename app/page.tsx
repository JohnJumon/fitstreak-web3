"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMetaMaskProvider } from "@/lib/provider";
import { storeWallet } from "@/lib/walletSession";

export default function HomePage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState("Wallet not connected");

  async function connectWallet() {
    try {
      setConnecting(true);
      const provider = getMetaMaskProvider();
      if (!provider) {
        setStatus("MetaMask provider not found. Disable other wallet extensions and retry.");
        return;
      }

      const result = (await provider.request({
        method: "eth_requestAccounts"
      })) as string[];

      if (result[0]) {
        storeWallet(result[0]);
        setStatus(`Connected: ${result[0]}`);
        router.push("/log");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Wallet request failed");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-[#007bff]/40 bg-[#007bff]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8ec3ff]">
            Minimal Web3 Tracker
          </p>
          <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            <span className="block bg-gradient-to-r from-white to-white/75 bg-clip-text text-transparent">
              FitStreak
            </span>
            <span className="mt-3 block text-xl font-semibold leading-tight text-[#8ec3ff] sm:text-3xl md:text-4xl">
              Own Your Progress Onchain
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            A sleek workout streak platform with wallet-native identity, daily logs, and collectible
            milestone badges.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="w-full rounded-2xl bg-[#007bff] px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(0,123,255,0.35)] transition hover:bg-[#1d8bff] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10 sm:text-lg"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
          <p className="mt-4 text-sm text-white/70">{status}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/60">Current Streak</p>
              <p className="mt-2 text-2xl font-bold text-[#007bff]">14 Days</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/60">Badges Earned</p>
              <p className="mt-2 text-2xl font-bold text-[#007bff]">3</p>
            </div>
            <div className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/60">Latest Workout Note</p>
              <p className="mt-2 text-sm text-white/85">
                Strength training, 45 mins. Added progressive overload and focused on tempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Wallet-First Identity</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Connect instantly and keep your activity linked to your wallet without traditional
              account setup.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Structured Daily Logs</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Capture workout type, duration, and notes in a clear, consistent, and mobile-friendly
              format.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Milestone Badge System</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Unlock achievement badges at streak milestones with collectible proof of consistency.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
