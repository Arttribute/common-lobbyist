/**
 * Blockscout API Service
 *
 * Provides blockchain explorer data for DAO transactions, signals, and token activity.
 * This service integrates with Blockscout API to give the agent context about on-chain activity.
 */

import { Address, formatEther, formatUnits } from "viem";

const BLOCKSCOUT_BASE_URL = "https://base-sepolia.blockscout.com/api/v2";

export interface Transaction {
  hash: string;
  from: Address;
  to: Address;
  value: string;
  timestamp: string;
  status: string;
  method?: string;
  gasUsed?: string;
  blockNumber: number;
}

export interface TokenTransfer {
  hash: string;
  from: Address;
  to: Address;
  value: string;
  token: {
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
  };
  timestamp: string;
  method?: string;
}

export interface AddressInfo {
  address: Address;
  balance: string;
  transactionCount: number;
  tokenBalances?: Array<{
    token: {
      address: Address;
      name: string;
      symbol: string;
    };
    value: string;
  }>;
}

class BlockscoutService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BLOCKSCOUT_BASE_URL;
  }

  /**
   * Get transaction history for an address
   */
  async getTransactions(
    address: Address,
    options: {
      filter?: "to" | "from";
      limit?: number;
    } = {}
  ): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams({
        ...(options.filter && { filter: options.filter }),
      });

      const response = await fetch(
        `${this.baseUrl}/addresses/${address}/transactions?${params}`
      );

      if (!response.ok) {
        console.error("Blockscout API error:", response.statusText);
        return [];
      }

      const data = await response.json();

      return (data.items || [])
        .slice(0, options.limit || 50)
        .map((tx: any) => ({
          hash: tx.hash,
          from: tx.from.hash as Address,
          to: tx.to?.hash as Address,
          value: formatEther(BigInt(tx.value || "0")),
          timestamp: tx.timestamp,
          status: tx.status,
          method: tx.method,
          gasUsed: tx.gas_used,
          blockNumber: parseInt(tx.block),
        }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  /**
   * Get token transfers for an address
   */
  async getTokenTransfers(
    address: Address,
    tokenAddress?: Address,
    limit: number = 50
  ): Promise<TokenTransfer[]> {
    try {
      const params = new URLSearchParams({
        type: "ERC-20",
        ...(tokenAddress && { token: tokenAddress }),
      });

      const response = await fetch(
        `${this.baseUrl}/addresses/${address}/token-transfers?${params}`
      );

      if (!response.ok) {
        console.error("Blockscout API error:", response.statusText);
        return [];
      }

      const data = await response.json();

      return (data.items || [])
        .slice(0, limit)
        .map((transfer: any) => ({
          hash: transfer.tx_hash,
          from: transfer.from.hash as Address,
          to: transfer.to.hash as Address,
          value: formatUnits(
            BigInt(transfer.total.value || "0"),
            transfer.token.decimals || 18
          ),
          token: {
            address: transfer.token.address as Address,
            name: transfer.token.name,
            symbol: transfer.token.symbol,
            decimals: transfer.token.decimals || 18,
          },
          timestamp: transfer.timestamp,
          method: transfer.method,
        }));
    } catch (error) {
      console.error("Error fetching token transfers:", error);
      return [];
    }
  }

  /**
   * Get address information including balances
   */
  async getAddressInfo(address: Address): Promise<AddressInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/addresses/${address}`);

      if (!response.ok) {
        console.error("Blockscout API error:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        address: data.hash as Address,
        balance: formatEther(BigInt(data.coin_balance || "0")),
        transactionCount: data.transactions_count || 0,
        tokenBalances: (data.token_balances || []).map((balance: any) => ({
          token: {
            address: balance.token.address as Address,
            name: balance.token.name,
            symbol: balance.token.symbol,
          },
          value: formatUnits(
            BigInt(balance.value || "0"),
            balance.token.decimals || 18
          ),
        })),
      };
    } catch (error) {
      console.error("Error fetching address info:", error);
      return null;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${txHash}`);

      if (!response.ok) {
        console.error("Blockscout API error:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        hash: data.hash,
        from: data.from.hash as Address,
        to: data.to?.hash as Address,
        value: formatEther(BigInt(data.value || "0")),
        status: data.status,
        timestamp: data.timestamp,
        blockNumber: parseInt(data.block),
        gasUsed: data.gas_used,
        gasPrice: data.gas_price,
        method: data.method,
        decodedInput: data.decoded_input,
        explorerUrl: `https://base-sepolia.blockscout.com/tx/${data.hash}`,
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  /**
   * Get smart contract logs/events for an address
   */
  async getContractLogs(
    address: Address,
    topic?: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (topic) params.append("topic", topic);

      const response = await fetch(
        `${this.baseUrl}/addresses/${address}/logs?${params}`
      );

      if (!response.ok) {
        console.error("Blockscout API error:", response.statusText);
        return [];
      }

      const data = await response.json();
      return (data.items || []).slice(0, limit);
    } catch (error) {
      console.error("Error fetching contract logs:", error);
      return [];
    }
  }

  /**
   * Generate explorer link
   */
  getExplorerLink(type: "tx" | "address" | "token", value: string): string {
    return `https://base-sepolia.blockscout.com/${type}/${value}`;
  }
}

// Export singleton instance
export const blockscoutService = new BlockscoutService();
