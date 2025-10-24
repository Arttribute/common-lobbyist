// components/forum/signal-button.tsx
"use client";

import { useState } from "react";
import { useSignal } from "@/hooks/use-signal";
import { useAuth } from "@/context/auth-context";
import { formatUnits } from "viem";

interface SignalButtonProps {
  contentId: string;
  daoId: string;
  registryAddress: string;
  tokenAddress: string;
  currentSignals: string; // Total signals on this content
  userSignal?: string; // User's current signal on this content
  onSignalComplete?: () => void;
}

export default function SignalButton({
  contentId,
  daoId,
  registryAddress,
  tokenAddress,
  currentSignals,
  userSignal = "0",
  onSignalComplete,
}: SignalButtonProps) {
  const { authenticated, login } = useAuth();
  const { placeTokens, withdrawTokens, isLoading } = useSignal();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"place" | "withdraw">("place");

  const handleOpenModal = (actionType: "place" | "withdraw") => {
    if (!authenticated) {
      login();
      return;
    }
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      if (action === "place") {
        await placeTokens(
          registryAddress,
          tokenAddress,
          contentId,
          amount,
          daoId
        );
      } else {
        await withdrawTokens(registryAddress, contentId, amount, daoId);
      }

      setShowModal(false);
      setAmount("");
      if (onSignalComplete) {
        onSignalComplete();
      }
    } catch (error) {
      console.error("Signal error:", error);
      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${action} signal`
      );
    }
  };

  const displaySignals = formatUnits(BigInt(currentSignals || "0"), 18);
  const displayUserSignal = formatUnits(BigInt(userSignal || "0"), 18);
  const hasUserSignal = parseFloat(displayUserSignal) > 0;

  return (
    <>
      {/* Signal Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenModal("place")}
          disabled={isLoading}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors disabled:opacity-50"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-none stroke-current"
          >
            <path d="M11.37.83L12 3.28l.63-2.45h-1.26zM13.92 3.95l1.52-2.1-1.18-.4-.34 2.5zM8.59 1.84l1.52 2.11-.34-2.5-1.18.4zM18.52 18.92a4.23 4.23 0 0 1-2.62 1.33l.41-.37c2.39-2.4 2.86-4.95 1.4-7.63l-.91-1.6-.8-1.67c-.25-.56-.19-.98.21-1.29a.7.7 0 0 1 .55-.13c.28.05.54.23.72.5l2.37 4.16c.97 1.62 1.14 4.23-1.33 6.7zm-11-.44l-4.15-4.15a.83.83 0 0 1 1.17-1.17l2.16 2.16a.37.37 0 0 0 .51-.52l-2.15-2.16L3.6 11.2a.83.83 0 0 1 1.17-1.17l3.43 3.44a.36.36 0 0 0 .52 0 .36.36 0 0 0 0-.52L5.29 9.51l-.97-.97a.83.83 0 0 1 0-1.16.84.84 0 0 1 1.17 0l.97.97 3.44 3.43a.36.36 0 0 0 .51 0 .37.37 0 0 0 0-.52L6.98 7.83a.82.82 0 0 1-.18-.9.82.82 0 0 1 .76-.51c.22 0 .43.09.58.24l5.8 5.79a.37.37 0 0 0 .58-.42L13.4 9.67c-.26-.56-.2-.98.2-1.29a.7.7 0 0 1 .55-.13c.28.05.55.23.73.5l2.2 3.86c1.3 2.38.87 4.59-1.29 6.75a4.65 4.65 0 0 1-4.19 1.37 7.73 7.73 0 0 1-4.07-2.25z"></path>
          </svg>
          <span className="text-sm">
            {parseFloat(displaySignals).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </button>

        {hasUserSignal && (
          <button
            onClick={() => handleOpenModal("withdraw")}
            disabled={isLoading}
            className="text-xs text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
          >
            (You: {parseFloat(displayUserSignal).toLocaleString(undefined, { maximumFractionDigits: 2 })})
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {action === "place" ? "Place" : "Withdraw"} Tokens
            </h3>

            {hasUserSignal && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Your current signal: {displayUserSignal} tokens
              </p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Amount (tokens)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                disabled={isLoading}
              />
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {action === "place" ? (
                <p>
                  Place tokens to signal support. Quadratic voting applies: weight = √tokens
                </p>
              ) : (
                <p>
                  Withdraw tokens to reduce your signal. You can withdraw up to{" "}
                  {displayUserSignal} tokens.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAmount("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
              >
                {isLoading
                  ? "Processing..."
                  : action === "place"
                  ? "Place"
                  : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
