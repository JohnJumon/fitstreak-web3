"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { shortenAddress } from "@/lib/walletSession";

type Props = {
  walletAddress: string;
};

export default function AppNav({ walletAddress }: Props) {
  const pathname = usePathname();
  const itemClass = (href: string) =>
    `transition ${pathname === href ? "text-white" : "text-white/70 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1a1a1a]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          FitStreak
        </Link>
        <nav className="order-3 flex w-full items-center gap-5 text-sm sm:order-2 sm:w-auto sm:gap-6">
          <Link href="/log" className={itemClass("/log")}>
            Log
          </Link>
          <Link href="/profile" className={itemClass("/profile")}>
            Profile
          </Link>
        </nav>
        <p className="ml-auto max-w-[58vw] truncate rounded-full border border-[#007bff]/40 bg-[#007bff]/10 px-3 py-1 text-xs font-medium text-[#8ec3ff] sm:order-3 sm:max-w-none">
          {walletAddress ? shortenAddress(walletAddress) : "Not connected"}
        </p>
      </div>
    </header>
  );
}
