"use client";

import { useState } from "react";
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import { badgeAbi } from "@/lib/contract";
import { getMetaMaskProvider } from "@/lib/provider";

type Props = {
  walletAddress: string;
  milestone: number | null;
  onMinted?: () => Promise<void> | void;
};

type MintStep = "idle" | "preparing" | "awaiting_signature" | "confirming" | "minted" | "error";

function getStepState(current: MintStep, step: MintStep): "pending" | "active" | "done" {
  const order: MintStep[] = ["preparing", "awaiting_signature", "confirming", "minted"];
  const currentIdx = order.indexOf(current);
  const stepIdx = order.indexOf(step);
  if (current === "error") {
    return "pending";
  }
  if (currentIdx > stepIdx) {
    return "done";
  }
  if (currentIdx === stepIdx) {
    return "active";
  }
  return "pending";
}

export default function MintBadgeButton({ walletAddress, milestone, onMinted }: Props) {
  const [status, setStatus] = useState<string>("Idle");
  const [mintStep, setMintStep] = useState<MintStep>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_BADGE_CONTRACT as `0x${string}` | undefined;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  async function ensureSepolia() {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask provider not found. Disable other wallet extensions and retry.");
    }

    const chainId = (await provider.request({
      method: "eth_chainId"
    })) as string;

    if (chainId === "0xaa36a7") {
      return;
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }]
      });
    } catch {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: {
              name: "SepoliaETH",
              symbol: "SEP",
              decimals: 18
            },
            rpcUrls: [rpcUrl],
            blockExplorerUrls: ["https://sepolia.etherscan.io"]
          }
        ]
      });
    }
  }

  async function mintBadge() {
    const provider = getMetaMaskProvider();
    if (!milestone || !contractAddress || !rpcUrl) return;
    if (!provider) {
      setStatus("MetaMask provider not found. Disable other wallet extensions and retry.");
      return;
    }
    setMintStep("preparing");
    setStatus("Preparing wallet...");

    try {
      await ensureSepolia();
      setStatus("Checking mint status...");

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl)
      });

      const alreadyMinted = (await publicClient.readContract({
        address: contractAddress,
        abi: badgeAbi,
        functionName: "hasMintedMilestone",
        args: [walletAddress as `0x${string}`, BigInt(milestone)]
      })) as boolean;

      if (alreadyMinted) {
        setStatus("You already minted this milestone badge.");
        return;
      }

      setMintStep("awaiting_signature");
      setStatus("Awaiting wallet signature...");

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(provider)
      });

      const [account] = await walletClient.requestAddresses();
      if (account.toLowerCase() !== walletAddress.toLowerCase()) {
        setStatus("Connected account does not match selected wallet.");
        return;
      }
      setStatus("Submitting transaction...");

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: badgeAbi,
        functionName: "mintBadge",
        account,
        args: [
          walletAddress as `0x${string}`,
          BigInt(milestone),
          `ipfs://badge-${milestone}-metadata.json`
        ]
      });

      setTxHash(hash);
      setMintStep("confirming");
      setStatus("Transaction sent. Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        throw new Error("Transaction failed onchain.");
      }

      setMintStep("minted");
      setStatus("Badge minted successfully.");
      setShowSuccess(true);

      await onMinted?.();
      window.dispatchEvent(
        new CustomEvent("fitstreak-badge-minted", {
          detail: { walletAddress, milestone, hash }
        })
      );
    } catch (err) {
      setMintStep("error");
      setStatus(err instanceof Error ? err.message : "Mint failed");
    }
  }

  const isBusy = mintStep === "preparing" || mintStep === "awaiting_signature" || mintStep === "confirming";
  const stepStyles: Record<"pending" | "active" | "done", string> = {
    pending: "border-white/15 text-white/45",
    active: "border-[#007bff] text-[#8ec3ff]",
    done: "border-emerald-400/60 text-emerald-300"
  };

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-semibold text-white">Mint Badge</h2>
        <p className="mt-1 text-sm text-white/65">
          {milestone ? `Milestone ready: ${milestone} days` : "No milestone available yet."}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {[
            ["preparing", "Prepare"],
            ["awaiting_signature", "Sign"],
            ["confirming", "Confirm"],
            ["minted", "Minted"]
          ].map(([step, label]) => {
            const state = getStepState(mintStep, step as MintStep);
            return (
              <div
                key={step}
                className={`rounded-lg border px-2 py-2 text-center text-xs font-medium ${stepStyles[state]}`}
              >
                {label}
              </div>
            );
          })}
        </div>

        <button
          onClick={mintBadge}
          disabled={!milestone || !contractAddress || !rpcUrl || isBusy}
          className="mt-4 rounded-xl bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8bff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? "Processing..." : milestone ? `Mint ${milestone}-Day Badge` : "No Badge Available"}
        </button>
        <p className="mt-3 text-sm text-white/70">{status}</p>
      </section>

      {showSuccess && txHash ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#007bff]/35 bg-[#101828] p-5 text-white shadow-2xl">
            <p className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
              Badge Minted
            </p>
            <h3 className="mt-3 text-xl font-bold">{milestone}-Day Badge Unlocked</h3>
            <p className="mt-2 text-sm text-white/75">
              Your badge mint was confirmed onchain.
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-[#8ec3ff] underline underline-offset-4"
            >
              View transaction
            </a>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a
                href="/profile"
                className="rounded-xl border border-white/20 px-4 py-2 text-center text-sm font-semibold text-white/90 transition hover:border-white/40"
              >
                View Profile
              </a>
              <button
                onClick={() => setShowSuccess(false)}
                className="rounded-xl bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8bff]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
