// app/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useContracts } from "@/hooks/use-contracts";
import { getDaoFactoryAddress } from "@/lib/contracts/config";
import { baseSepolia } from "viem/chains";

export default function NewOrganization() {
  const router = useRouter();
  const { authenticated, login, authState } = useAuth();
  const {
    createDAO,
    isLoading: contractLoading,
    error: contractError,
    isConnected,
  } = useContracts();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [metadataCid, setMetadataCid] = useState("");
  const [agentPersona, setAgentPersona] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "deploying" | "saving">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!authenticated) {
      alert("Please login to create a DAO");
      await login();
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet to create a DAO");
      return;
    }

    if (!name.trim() || !tokenName.trim() || !tokenSymbol.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setStep("deploying");

    try {
      // Step 1: Deploy contracts on-chain
      console.log("Deploying DAO on-chain...");
      const result = await createDAO({
        name: tokenName,
        symbol: tokenSymbol,
        initialSupply,
        metadataCid:
          metadataCid || `dao:${name.toLowerCase().replace(/\s+/g, "-")}`,
      });

      if (!result) {
        throw new Error(contractError || "Failed to deploy DAO on-chain");
      }

      console.log("DAO deployed successfully:", result);

      // Step 2: Save to database
      setStep("saving");
      console.log("Saving DAO to database...");

      const res = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          tokenName,
          tokenSymbol,
          initialSupply,
          onchain: {
            chainId: baseSepolia.id,
            factory: getDaoFactoryAddress(baseSepolia.id),
            registry: result.registryAddress,
            token: result.tokenAddress,
            txHash: result.txHash,
            deployedBy: authState.walletAddress,
          },
          agent: {
            persona: agentPersona,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error || "Failed to save organization to database"
        );
      }

      const org = await res.json();
      console.log("DAO saved to database:", org);

      // Success! Redirect to the organization page
      router.push(`/organization/${org._id}`);
    } catch (error) {
      console.error("Error creating organization:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create organization"
      );
      setLoading(false);
      setStep("form");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Create a new DAO
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Deploy your Common Lobbyist DAO on-chain. Your DAO will have its own
            governance token and signal registry for collective memory
            management.
          </p>
        </div>

        {!authenticated && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Please login to create a DAO
            </p>
            <button
              onClick={() => login()}
              className="mt-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors"
            >
              Login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              DAO Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ethereum Governance"
              className="w-full px-0 py-2.5 text-xl border-0 border-b-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your DAO's purpose and goals..."
              rows={3}
              className="w-full px-0 py-2.5 text-base border-0 border-b-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              disabled={loading}
            />
          </div>

          {/* Agent Persona */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-7 mt-7">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Community Agent
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Your DAO will have an AI agent to help members understand community priorities and provide insights on proposals.
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Agent Persona (Optional)
              </label>
              <textarea
                value={agentPersona}
                onChange={(e) => setAgentPersona(e.target.value)}
                placeholder="e.g. A thoughtful advocate focused on environmental sustainability and long-term community growth. Values transparency and data-driven decision making..."
                rows={4}
                className="w-full px-4 py-2.5 text-base border-2 border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Leave blank to use a default persona that will be tailored to your DAO
              </p>
            </div>
          </div>

          {/* Token Details */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-7 mt-7">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Governance Token Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. Ethereum Governance Token"
                  className="w-full px-4 py-2.5 text-base border-2 border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. EGT"
                  maxLength={6}
                  className="w-full px-4 py-2.5 text-base border-2 border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Initial Supply *
                </label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(e.target.value)}
                  placeholder="1000000"
                  min="1"
                  className="w-full px-4 py-2.5 text-base border-2 border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Initial tokens will be minted to your wallet
                </p>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <strong>Network:</strong> Base Sepolia (Testnet)
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              <strong>Factory Contract:</strong>{" "}
              {getDaoFactoryAddress(baseSepolia.id)}
            </p>
          </div>

          {/* Status Messages */}
          {loading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {step === "deploying" &&
                  "⏳ Deploying contracts on-chain... Please confirm the transaction in your wallet."}
                {step === "saving" && "⏳ Saving DAO to database..."}
              </p>
            </div>
          )}

          {contractError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Error: {contractError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={
                loading ||
                !authenticated ||
                !name.trim() ||
                !tokenName.trim() ||
                !tokenSymbol.trim()
              }
              className="w-full px-6 py-3 text-base bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? step === "deploying"
                  ? "Deploying..."
                  : "Saving..."
                : "Deploy DAO"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
