import { EthereumProvider } from "@/lib/eth";

export function getMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  const rootProvider = window.ethereum;
  if (Array.isArray(rootProvider.providers) && rootProvider.providers.length > 0) {
    const metaMask = rootProvider.providers.find((provider) => provider.isMetaMask);
    return metaMask ?? null;
  }

  return rootProvider.isMetaMask ? rootProvider : null;
}
