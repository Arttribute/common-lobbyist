"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Address } from "viem";
import { useCommonToken } from "@/lib/hooks/use-common-token";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AgentFundingProps {
  organizationId: string;
  organizationName: string;
  agentId: string;
  isCreator: boolean;
}

export default function AgentFunding({
  organizationId,
  organizationName,
  agentId,
  isCreator,
}: AgentFundingProps) {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const { authenticated, authState } = useAuth();
  const {
    useCommonBalance,
    transferTokens,
    isTransferPending,
    transferHash,
    transferError,
  } = useCommonToken();

  const userAddress = authState.walletAddress as Address | undefined;
  const { balance: userCommonBalance, isLoading: isLoadingUserBalance } =
    useCommonBalance(userAddress);

  const [lastTransferHash, setLastTransferHash] = useState<Address | null>(
    null
  );

  useEffect(() => {
    loadAgentBalance();
  }, [organizationId]);

  // Handle successful transfer
  useEffect(() => {
    if (
      transferHash &&
      transferHash !== lastTransferHash &&
      !isTransferPending
    ) {
      setLastTransferHash(transferHash);
      showMessage("success", "Tokens sent successfully!");
      setAmount("");
      loadAgentBalance();
    }
  }, [transferHash, isTransferPending, lastTransferHash]);

  // Handle transfer errors
  useEffect(() => {
    if (transferError) {
      showMessage("error", transferError.message || "Transaction failed");
    }
  }, [transferError]);

  const loadAgentBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await fetch(`/api/agent/${organizationId}/balance`);

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setWalletAddress(data.walletAddress);
      }
    } catch (error) {
      console.error("Error loading agent balance:", error);
      showMessage("error", "Failed to load agent balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSend = async () => {
    if (!authenticated) {
      showMessage("error", "Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showMessage("error", "Please enter a valid amount");
      return;
    }

    if (!walletAddress) {
      showMessage("error", "Agent wallet address not available");
      return;
    }

    try {
      // Send tokens using viem via useCommonToken hook
      await transferTokens(walletAddress as Address, amount);
    } catch (error: any) {
      console.error("Error sending tokens:", error);
      showMessage("error", error.message || "Failed to send tokens");
    }
  };

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(bal);
  };

  const getBalanceColor = () => {
    if (balance === null) return "text-gray-500";
    if (balance < 10) return "text-red-600";
    if (balance < 50) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Balance Display */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <div>
              <h3 className="tracking-tight text-gray-900">Agent Balance</h3>
              <p className="text-xs text-gray-600">
                $COMMON tokens available for agent operations
              </p>
            </div>
          </div>
          {isLoadingBalance ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          ) : (
            <div className="text-right">
              <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                {balance !== null ? formatBalance(balance) : "---"}
              </p>
              <p className="text-xs text-gray-600">$COMMON</p>
            </div>
          )}
        </div>

        {/* Low Balance Warning */}
        {balance !== null && balance < 10 && isCreator && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Low Balance Warning</p>
              <p className="text-xs mt-1">
                Agent balance is low. Fund the agent to ensure continuous
                operation.
              </p>
            </div>
          </div>
        )}

        {/* Agent Wallet Address */}
        {walletAddress && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Agent Wallet Address:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono flex-1 truncate">
                {walletAddress}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  showMessage("success", "Address copied!");
                }}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Balance & Faucet */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">
                Your $COMMON Balance
              </h3>
              <p className="text-xs text-gray-600">Available in your wallet</p>
            </div>
          </div>
          {isLoadingUserBalance ? (
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          ) : (
            <div className="text-right">
              <p className="text-xl font-bold text-purple-600">
                {parseFloat(userCommonBalance || "0").toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">$COMMON</p>
            </div>
          )}
        </div>

        {/* Faucet Link */}
        {parseFloat(userCommonBalance || "0") < 10 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Need more $COMMON?
                </p>
                <p className="text-xs text-purple-700">
                  Get tokens instantly from the faucet
                </p>
              </div>
            </div>
            <Link
              href="/faucet"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              Get Tokens
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : message.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : message.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <Info className="w-5 h-5 text-blue-600" />
          )}
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-800"
                : message.type === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Funding Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {isCreator ? "Fund Agent" : "Support Agent"}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {isCreator
            ? "Add $COMMON tokens to your agent's wallet to keep it running. Each chat interaction consumes a small amount of tokens."
            : "Support the agent by donating $COMMON tokens. Your contribution helps keep the agent operational for everyone."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($COMMON)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setAmount("10")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              10
            </button>
            <button
              onClick={() => setAmount("50")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              50
            </button>
            <button
              onClick={() => setAmount("100")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              100
            </button>
            <button
              onClick={() => setAmount("500")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              500
            </button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!authenticated || isTransferPending || !amount}
            className="w-full rounded-md"
          >
            {isTransferPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing transaction...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isCreator ? "Fund Agent" : "Donate"}
              </>
            )}
          </Button>

          {transferHash && (
            <div className="text-xs text-gray-600 text-center">
              Transaction:{" "}
              <a
                href={`https://basescan.org/tx/${transferHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono"
              >
                {transferHash.slice(0, 10)}...{transferHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">About Agent Costs</p>
          <ul className="text-xs space-y-1 text-blue-800">
            <li>• Chat interactions are free for DAO members</li>
            <li>• {"The agent's wallet pays for all operations"}</li>
            <li>• Costs vary based on message length and complexity</li>
            <li>
              • {isCreator ? "Keep" : "Help keep"} the agent funded to ensure
              24/7 availability
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
