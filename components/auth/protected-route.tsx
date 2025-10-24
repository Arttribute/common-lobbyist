// components/auth/protected-route.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireWallet?: boolean;
}

/**
 * Wrapper component to protect routes that require authentication
 * Usage: Wrap your page content with this component
 */
export function ProtectedRoute({
  children,
  redirectTo = "/",
  requireWallet = false,
}: ProtectedRouteProps) {
  const { ready, authenticated, authState, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      // Show login prompt or redirect
      router.push(redirectTo);
    }

    if (requireWallet && !authState.walletAddress) {
      // User is authenticated but doesn't have a wallet
      console.warn("Wallet required but not found");
    }
  }, [ready, authenticated, authState.walletAddress, requireWallet, router, redirectTo]);

  // Show loading state while checking authentication
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Authentication Required
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Please login to access this page.
          </p>
          <button
            onClick={() => login()}
            className="px-6 py-3 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Show wallet required message if wallet is needed but not found
  if (requireWallet && !authState.walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Wallet Required
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            This page requires a connected wallet. Please connect your wallet to continue.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
