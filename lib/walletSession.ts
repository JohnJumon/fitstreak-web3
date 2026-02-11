const WALLET_KEY = "workout_wallet";

export function getStoredWallet(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(WALLET_KEY) ?? "";
}

export function storeWallet(address: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(WALLET_KEY, address);
}

export function clearStoredWallet(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(WALLET_KEY);
}

export function shortenAddress(address: string): string {
  if (address.length < 12) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
