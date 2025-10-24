/**
 * Hook for interacting with the $COMMON token using viem
 *
 * Provides utilities for:
 * - Checking user balance
 * - Transferring tokens
 * - Getting tokens via faucet (send ETH)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useWallets } from '@privy-io/react-auth';
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  Address,
  parseEther,
  formatEther,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import { CommonTokenAbi } from '@/lib/abis/common-token';

const COMMON_TOKEN_ADDRESS = "0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F" as Address;

export function useCommonToken() {
  const { authenticated, authState } = useAuth();
  const { wallets } = useWallets();
  const activeWallet = wallets.find((wallet) => wallet);

  const [isTransferPending, setIsTransferPending] = useState(false);
  const [transferHash, setTransferHash] = useState<Address | null>(null);
  const [transferError, setTransferError] = useState<Error | null>(null);

  const [isBuyPending, setIsBuyPending] = useState(false);
  const [buyHash, setBuyHash] = useState<Address | null>(null);
  const [buyError, setBuyError] = useState<Error | null>(null);

  // Create public client for reading
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  // Hook to get user's $COMMON balance
  const useCommonBalance = (address?: Address) => {
    const [balance, setBalance] = useState<string>('0');
    const [balanceRaw, setBalanceRaw] = useState<bigint | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBalance = async () => {
      if (!address) {
        setBalance('0');
        setBalanceRaw(undefined);
        return;
      }

      setIsLoading(true);
      try {
        const bal = await publicClient.readContract({
          address: COMMON_TOKEN_ADDRESS,
          abi: CommonTokenAbi,
          functionName: 'balanceOf',
          args: [address],
        }) as bigint;

        setBalanceRaw(bal);
        setBalance(formatEther(bal));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
        setBalanceRaw(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchBalance();
    }, [address]);

    return {
      balance,
      balanceRaw,
      isLoading,
      refetch: fetchBalance,
    };
  };

  // Get ETH to COMMON conversion rate
  const [ethToCommonRate, setEthToCommonRate] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rate = await publicClient.readContract({
          address: COMMON_TOKEN_ADDRESS,
          abi: CommonTokenAbi,
          functionName: 'ETH_TO_COMMON_RATE',
        }) as bigint;
        setEthToCommonRate(rate);
      } catch (error) {
        console.error('Error fetching rate:', error);
      }
    };
    fetchRate();
  }, []);

  // Transfer tokens
  const transferTokens = async (to: Address, amount: string) => {
    if (!authenticated || !authState.walletAddress || !activeWallet) {
      throw new Error('Please connect your wallet');
    }

    setIsTransferPending(true);
    setTransferError(null);

    try {
      const provider = await activeWallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
      });

      const hash = await walletClient.writeContract({
        address: COMMON_TOKEN_ADDRESS,
        abi: CommonTokenAbi,
        functionName: 'transfer',
        args: [to, parseEther(amount)],
        account: authState.walletAddress as Address,
      });

      setTransferHash(hash);

      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error: any) {
      console.error('Transfer error:', error);
      setTransferError(error);
      throw error;
    } finally {
      setIsTransferPending(false);
    }
  };

  // Get tokens by sending ETH
  const getTokens = async (ethAmount: string) => {
    if (!authenticated || !authState.walletAddress || !activeWallet) {
      throw new Error('Please connect your wallet');
    }

    setIsBuyPending(true);
    setBuyError(null);

    try {
      const provider = await activeWallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
      });

      // Send ETH to the contract's receive function
      const hash = await walletClient.sendTransaction({
        to: COMMON_TOKEN_ADDRESS,
        value: parseEther(ethAmount),
        account: authState.walletAddress as Address,
      });

      setBuyHash(hash);

      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error: any) {
      console.error('Buy tokens error:', error);
      setBuyError(error);
      throw error;
    } finally {
      setIsBuyPending(false);
    }
  };

  // Calculate how many $COMMON you'll get for X ETH
  const calculateCommonAmount = (ethAmount: string) => {
    if (!ethToCommonRate) return '0';
    try {
      const ethInWei = parseEther(ethAmount);
      const commonAmount = (ethInWei * ethToCommonRate) / BigInt(1e18);
      return formatEther(commonAmount);
    } catch {
      return '0';
    }
  };

  // Calculate how much ETH needed for X $COMMON
  const calculateEthNeeded = (commonAmount: string) => {
    if (!ethToCommonRate) return '0';
    try {
      const commonInWei = parseEther(commonAmount);
      const ethNeeded = (commonInWei * BigInt(1e18)) / ethToCommonRate;
      return formatEther(ethNeeded);
    } catch {
      return '0';
    }
  };

  return {
    // Constants
    COMMON_TOKEN_ADDRESS,
    ethToCommonRate,

    // Hooks
    useCommonBalance,

    // Transfer functions
    transferTokens,
    transferHash,
    isTransferPending,
    transferError,

    // Faucet functions
    getTokens,
    buyHash,
    isBuyPending,
    buyError,

    // Calculation helpers
    calculateCommonAmount,
    calculateEthNeeded,
  };
}
