// components/dao/token-balance.tsx
"use client";

import { useTokenBalance } from "@/hooks/use-token-balance";
import { formatUnits } from "viem";

interface TokenBalanceProps {
  organizationId: string;
  compact?: boolean;
}

export default function TokenBalance({
  organizationId,
  compact = false,
}: TokenBalanceProps) {
  const { balance, loading, error } = useTokenBalance(organizationId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
        {!compact && <span>Loading balance...</span>}
      </div>
    );
  }

  if (error || !balance) {
    return null;
  }

  const formattedBalance = formatUnits(BigInt(balance.balance), 18);
  const displayBalance = parseFloat(formattedBalance).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }
  );

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {displayBalance} {balance.tokenSymbol}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Your Balance
        </span>
        <div className="w-2 h-2 bg-green-500 rounded-full" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {displayBalance}
        </span>
        <span className="text-sm text-neutral-500">{balance.tokenSymbol}</span>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        {balance.tokenName}
      </p>
    </div>
  );
}
