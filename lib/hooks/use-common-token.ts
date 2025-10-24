/**
 * Hook for interacting with the $COMMON token
 *
 * Provides utilities for:
 * - Checking user balance
 * - Transferring tokens
 * - Getting tokens via faucet (send ETH)
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { Address, parseEther, formatEther } from 'viem';
import { CommonTokenAbi } from '@/lib/abis/common-token';

const COMMON_TOKEN_ADDRESS = "0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F" as Address;

export function useCommonToken() {
  // Read balance
  const useCommonBalance = (address?: Address) => {
    const { data: balance, isLoading, refetch } = useReadContract({
      address: COMMON_TOKEN_ADDRESS,
      abi: CommonTokenAbi,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    });

    return {
      balance: balance ? formatEther(balance as bigint) : '0',
      balanceRaw: balance as bigint | undefined,
      isLoading,
      refetch,
    };
  };

  // Read ETH to COMMON conversion rate
  const { data: ethToCommonRate } = useReadContract({
    address: COMMON_TOKEN_ADDRESS,
    abi: CommonTokenAbi,
    functionName: 'ETH_TO_COMMON_RATE',
  });

  // Transfer tokens
  const {
    writeContract: transfer,
    data: transferHash,
    isPending: isTransferPending,
    error: transferError,
  } = useWriteContract();

  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  // Get tokens by sending ETH (faucet)
  const {
    writeContract: buyTokens,
    data: buyHash,
    isPending: isBuyPending,
    error: buyError,
  } = useWriteContract();

  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } =
    useWaitForTransactionReceipt({
      hash: buyHash,
    });

  // Helper to transfer tokens
  const transferTokens = (to: Address, amount: string) => {
    transfer({
      address: COMMON_TOKEN_ADDRESS,
      abi: CommonTokenAbi,
      functionName: 'transfer',
      args: [to, parseEther(amount)],
    });
  };

  // Helper to get tokens (send ETH to contract)
  const getTokens = (ethAmount: string) => {
    buyTokens({
      address: COMMON_TOKEN_ADDRESS,
      abi: CommonTokenAbi,
      functionName: 'receive' as any, // Calling the receive function via send ETH
      value: parseEther(ethAmount),
    });
  };

  // Calculate how many $COMMON you'll get for X ETH
  const calculateCommonAmount = (ethAmount: string) => {
    if (!ethToCommonRate) return '0';
    const ethInWei = parseEther(ethAmount);
    const rate = ethToCommonRate as bigint;
    const commonAmount = (ethInWei * rate) / BigInt(1e18);
    return formatEther(commonAmount);
  };

  // Calculate how much ETH needed for X $COMMON
  const calculateEthNeeded = (commonAmount: string) => {
    if (!ethToCommonRate) return '0';
    const commonInWei = parseEther(commonAmount);
    const rate = ethToCommonRate as bigint;
    const ethNeeded = (commonInWei * BigInt(1e18)) / rate;
    return formatEther(ethNeeded);
  };

  return {
    // Constants
    COMMON_TOKEN_ADDRESS,
    ethToCommonRate: ethToCommonRate ? (ethToCommonRate as bigint) : BigInt(0),

    // Hooks
    useCommonBalance,

    // Transfer functions
    transferTokens,
    transferHash,
    isTransferPending,
    isTransferConfirming,
    isTransferSuccess,
    transferError,

    // Faucet functions
    getTokens,
    buyHash,
    isBuyPending,
    isBuyConfirming,
    isBuySuccess,
    buyError,

    // Calculation helpers
    calculateCommonAmount,
    calculateEthNeeded,
  };
}
