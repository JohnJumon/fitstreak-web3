"use client";

import { useState } from "react";
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import { badgeAbi } from "@/lib/contract";
import { getMetaMaskProvider } from "@/lib/provider";

type Props = {
  walletAddress: string;
  milestone: number | null;
};

export default function MintBadgeButton({ walletAddress, milestone }: Props) {
  const [status, setStatus] = useState<string>("Idle");
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
    if (!milestone || !provider || !contractAddress || !rpcUrl) return;
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

      setStatus(`Mint submitted: ${hash}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Mint failed");
    }
  }

  return (
    <section className="card">
      <h2>Mint Badge</h2>
      <button onClick={mintBadge} disabled={!milestone || !contractAddress || !rpcUrl}>
        {milestone ? `Mint ${milestone}-Day Badge` : "No Badge Available"}
      </button>
      <p className="small">{status}</p>
    </section>
  );
}
