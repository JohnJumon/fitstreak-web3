import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL ?? process.env.NEXT_PUBLIC_RPC_URL ?? "";
const privateKey = process.env.PRIVATE_KEY ?? "";
const normalizedPrivateKey =
  privateKey && !privateKey.startsWith("0x") ? `0x${privateKey}` : privateKey;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: normalizedPrivateKey ? [normalizedPrivateKey] : []
    }
  }
};

export default config;
