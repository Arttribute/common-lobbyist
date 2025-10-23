import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import "dotenv/config";
const privateKey = process.env.PRIVATE_KEY || "";
const apiKey = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    //Base
    baseMainnet: {
      type: "http",
      url: "https://mainnet.base.org",
      accounts: privateKey ? [privateKey] : [],
      gasPrice: 1000000000,
    },
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: privateKey ? [privateKey] : [],
      gasPrice: 1000000000,
    },
  },
};

export default config;
