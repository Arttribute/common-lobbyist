// hooks/use-token-balance.ts
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

interface TokenBalance {
  organizationId: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  userAddress: string;
}

export function useTokenBalance(organizationId: string | null) {
  const { authenticated, authState } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !authenticated || !authState.idToken) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/organization/${organizationId}/balance`, {
          headers: {
            Authorization: `Bearer ${authState.idToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch token balance");
        }

        const data = await res.json();
        setBalance(data);
      } catch (err) {
        console.error("Error fetching token balance:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [organizationId, authenticated, authState.idToken]);

  return { balance, loading, error };
}
