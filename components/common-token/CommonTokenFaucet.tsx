"use client";

import { useState, useEffect } from "react";
import { Droplets, Wallet, ArrowRight, Loader2, CheckCircle, AlertCircle, Info, Copy } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCommonToken } from "@/lib/hooks/use-common-token";
import { Address, createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";

export default function CommonTokenFaucet() {
  const { authenticated, authState } = useAuth();
  const { useCommonBalance, getTokens, isBuyPending, buyHash, buyError, calculateCommonAmount } = useCommonToken();

  const address = authState.walletAddress as Address | undefined;
  const { balance: commonBalance, refetch: refetchCommon } = useCommonBalance(address);

  const [ethBalance, setEthBalance] = useState<string>("0");
  const [ethAmount, setEthAmount] = useState("0.001");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [lastBuyHash, setLastBuyHash] = useState<Address | null>(null);

  // Fetch ETH balance
  useEffect(() => {
    const fetchEthBalance = async () => {
      if (!address) return;

      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      try {
        const balance = await publicClient.getBalance({ address });
        setEthBalance(formatEther(balance));
      } catch (error) {
        console.error("Error fetching ETH balance:", error);
      }
    };

    fetchEthBalance();
  }, [address]);

  // Handle successful token purchase
  useEffect(() => {
    if (buyHash && buyHash !== lastBuyHash && !isBuyPending) {
      setLastBuyHash(buyHash);
      showMessage("success", "Tokens received successfully!");
      refetchCommon();
      setEthAmount("0.001");
    }
  }, [buyHash, isBuyPending, lastBuyHash]);

  // Handle errors
  useEffect(() => {
    if (buyError) {
      showMessage("error", buyError.message || "Transaction failed");
    }
  }, [buyError]);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleGetTokens = async () => {
    if (!authenticated) {
      showMessage("error", "Please connect your wallet");
      return;
    }

    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      showMessage("error", "Please enter a valid ETH amount");
      return;
    }

    if (parseFloat(ethAmount) > parseFloat(ethBalance)) {
      showMessage("error", "Insufficient ETH balance");
      return;
    }

    try {
      await getTokens(ethAmount);
    } catch (error: any) {
      showMessage("error", error.message || "Failed to get tokens");
    }
  };

  const estimatedCommon = calculateCommonAmount(ethAmount);

  if (!authenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 text-center">
          <Droplets className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            $COMMON Token Faucet
          </h2>
          <p className="text-gray-600 mb-6">
            Get $COMMON tokens to fund your agents and participate in DAOs
          </p>
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              Please connect your wallet to use the faucet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              $COMMON Token Faucet
            </h2>
            <p className="text-sm text-gray-600">
              Exchange ETH for $COMMON tokens instantly
            </p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Your ETH Balance</p>
            <p className="text-lg font-bold text-gray-900">
              {parseFloat(ethBalance).toFixed(4)} ETH
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Your $COMMON Balance</p>
            <p className="text-lg font-bold text-purple-600">
              {parseFloat(commonBalance).toFixed(2)} $COMMON
            </p>
          </div>
        </div>
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

      {/* Exchange Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Get $COMMON Tokens
        </h3>

        {/* ETH Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Exchange (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.001"
                step="0.001"
                min="0"
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                ETH
              </span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setEthAmount("0.001")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              0.001 ETH
            </button>
            <button
              onClick={() => setEthAmount("0.005")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              0.005 ETH
            </button>
            <button
              onClick={() => setEthAmount("0.01")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              0.01 ETH
            </button>
            <button
              onClick={() => setEthAmount("0.05")}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              0.05 ETH
            </button>
          </div>

          {/* Conversion Display */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">You will receive</p>
                <p className="text-2xl font-bold text-purple-600">
                  ≈ {parseFloat(estimatedCommon).toFixed(2)} $COMMON
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          {/* Get Tokens Button */}
          <button
            onClick={handleGetTokens}
            disabled={isBuyPending || !ethAmount}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isBuyPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing transaction...
              </>
            ) : (
              <>
                <Droplets className="w-5 h-5" />
                Get $COMMON Tokens
              </>
            )}
          </button>

          {buyHash && (
            <div className="text-xs text-gray-600 text-center">
              Transaction:{" "}
              <a
                href={`https://basescan.org/tx/${buyHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono"
              >
                {buyHash.slice(0, 10)}...{buyHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 space-y-2">
            <p className="font-medium">About $COMMON Tokens</p>
            <ul className="text-xs space-y-1 text-blue-800">
              <li>• Use $COMMON to fund your DAO agents</li>
              <li>• Donate to support community agents</li>
              <li>• Required for agent chat interactions</li>
              <li>• Exchange rate is fixed by the contract</li>
              <li>• Instant delivery to your wallet</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Token Contract Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600 mb-2">$COMMON Token Contract</p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono flex-1 truncate">
            0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText("0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F");
              showMessage("success", "Address copied!");
            }}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <a
            href="https://basescan.org/address/0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View on BaseScan →
          </a>
        </p>
      </div>

      {/* How it Works */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Enter ETH Amount
              </p>
              <p className="text-xs text-gray-600">
                Specify how much ETH you want to exchange
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Confirm Transaction
              </p>
              <p className="text-xs text-gray-600">
                Approve the transaction in your wallet
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Receive $COMMON
              </p>
              <p className="text-xs text-gray-600">
                Tokens are instantly sent to your wallet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
