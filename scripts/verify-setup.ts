#!/usr/bin/env tsx
// scripts/verify-setup.ts
// Run this script to verify your setup is correct
// Usage: npx tsx scripts/verify-setup.ts

import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { getDaoFactoryAddress } from "../lib/contracts/config";
import { DaoFactoryAbi } from "../lib/abis/dao-factory";

async function main() {
  console.log("🔍 Verifying Common Lobbyist Setup...\n");

  // 1. Check environment variables
  console.log("1️⃣  Checking environment variables...");
  const requiredEnvVars = [
    "NEXT_PUBLIC_PRIVY_APP_ID",
    "PRIVY_APP_SECRET",
    "MONGODB_URI",
  ];

  let envVarsOk = true;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`   ❌ Missing: ${envVar}`);
      envVarsOk = false;
    } else {
      console.log(`   ✅ ${envVar}`);
    }
  }

  if (!envVarsOk) {
    console.log("\n⚠️  Please set missing environment variables in .env.local");
    process.exit(1);
  }

  // 2. Check smart contract
  console.log("\n2️⃣  Checking smart contract deployment...");
  try {
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const factoryAddress = getDaoFactoryAddress(baseSepolia.id);
    console.log(`   Factory address: ${factoryAddress}`);

    // Try to read from the contract
    const code = await publicClient.getBytecode({
      address: factoryAddress as `0x${string}`,
    });

    if (code && code !== "0x") {
      console.log(`   ✅ Contract deployed on Base Sepolia`);
      console.log(`   Bytecode size: ${code.length - 2} bytes`);
    } else {
      console.log(`   ❌ No contract found at ${factoryAddress}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`   ❌ Error checking contract: ${error}`);
    process.exit(1);
  }

  // 3. Check MongoDB connection
  console.log("\n3️⃣  Checking MongoDB connection...");
  try {
    const mongoose = await import("mongoose");
    await mongoose.default.connect(process.env.MONGODB_URI!);
    console.log(`   ✅ Connected to MongoDB`);
    await mongoose.default.disconnect();
  } catch (error) {
    console.log(`   ❌ MongoDB connection failed: ${error}`);
    console.log("   Make sure MongoDB is running or check your Atlas connection string");
    process.exit(1);
  }

  // 4. Check file structure
  console.log("\n4️⃣  Checking file structure...");
  const fs = await import("fs");
  const requiredFiles = [
    "lib/contracts/dao-factory.ts",
    "lib/contracts/signal-registry.ts",
    "lib/auth/middleware.ts",
    "hooks/useContracts.ts",
    "components/layout/navbar.tsx",
    "app/api/organization/route.ts",
    "models/Organization.ts",
    "models/Content.ts",
  ];

  let filesOk = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ Missing: ${file}`);
      filesOk = false;
    }
  }

  if (!filesOk) {
    console.log("\n⚠️  Some required files are missing");
    process.exit(1);
  }

  // 5. All checks passed
  console.log("\n✅ All checks passed!");
  console.log("\n🚀 You're ready to start the application:");
  console.log("   npm run dev");
  console.log("\nThen visit:");
  console.log("   http://localhost:3000");
  console.log("\n📚 Next steps:");
  console.log("   1. Login with your wallet or email");
  console.log("   2. Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
  console.log("   3. Create a DAO at /new");
  console.log("\n📖 Documentation:");
  console.log("   - SETUP.md - Setup guide");
  console.log("   - INTEGRATION.md - Architecture");
  console.log("   - TESTING.md - Testing guide");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
