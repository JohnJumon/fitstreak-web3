import { EthereumProvider } from "@/lib/eth";

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
