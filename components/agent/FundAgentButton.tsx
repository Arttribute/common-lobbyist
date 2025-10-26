// components/agent/FundAgentButton.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Address } from "viem";
import { useCommonToken } from "@/lib/hooks/use-common-token";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FundAgentButtonProps {
  organizationId: string;
  organizationName: string;
  agentId: string;
  className?: string;
}

export default function FundAgentButton({
  organizationId,
  organizationName,
  agentId,
  className = "",
}: FundAgentButtonProps) {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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
      await transferTokens(walletAddress as Address, amount);
    } catch (error: any) {
      console.error("Error sending tokens:", error);
      showMessage("error", error.message || "Failed to send tokens");
    }
  };

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(bal);
  };

  const getBalanceColor = () => {
    if (balance === null) return "text-gray-500";
    if (balance < 10) return "text-red-600";
    if (balance < 50) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors ${className}`}
          >
            <Wallet className="w-4 h-4" />
            Fund Agent
            {balance !== null && balance < 10 && (
              <AlertCircle className="w-3 h-3 text-yellow-300" />
            )}
          </button>
        </DialogTrigger>

        <DialogContent>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <DialogTitle>Fund {organizationName} Agent</DialogTitle>
            {/* Agent Balance */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Agent Balance
                  </span>
                </div>
                {isLoadingBalance ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <span className={`text-lg font-bold ${getBalanceColor()}`}>
                    {balance !== null ? formatBalance(balance) : "---"} $COMMON
                  </span>
                )}
              </div>
              {balance !== null && balance < 10 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  Low balance - agent may stop working soon
                </div>
              )}
            </div>

            {/* User Balance */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Your Balance
                </span>
                {isLoadingUserBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {parseFloat(userCommonBalance || "0").toFixed(2)} $COMMON
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`rounded-lg p-3 mb-4 flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : message.type === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : message.type === "error" ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )}
                <span
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-800"
                      : message.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  {message.text}
                </span>
              </div>
            )}

            {/* Funding Form */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[10, 50, 100, 500].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSend}
                disabled={!authenticated || isTransferPending || !amount}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isTransferPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Tokens
                  </>
                )}
              </button>

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

            {/* Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">About Agent Funding</p>
                  <p>
                    Your contribution helps keep the agent operational for all
                    DAO members. Each chat interaction consumes a small amount
                    of tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
