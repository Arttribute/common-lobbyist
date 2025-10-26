import { Address, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import dbConnect from '../dbConnect';
import Organization from '../../models/Organization';
import Content from '../../models/Content';
import { blockscoutService, type TokenTransfer } from './blockscout';

/**
 * On-Chain Data Service
 * Provides comprehensive on-chain context for DAO governance tokens and user activity
 * Combines data from Blockscout, smart contracts, and local database
 */
export class OnChainService {
  private publicClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
  }

  /**
   * Get comprehensive DAO token information
   * @param daoId - The DAO organization ID
   * @returns Token information with on-chain and database data
   */
  async getDaoTokenInfo(daoId: string) {
    await dbConnect();

    const dao = await Organization.findOne({ _id: daoId });
    if (!dao) {
      throw new Error(`DAO not found: ${daoId}`);
    }

    if (!dao.onchain?.token) {
      return {
        dao: {
          name: dao.name,
          tokenName: dao.tokenName,
          tokenSymbol: dao.tokenSymbol,
        },
        onchain: null,
        message: 'DAO token not yet deployed on-chain',
      };
    }

    const tokenAddress = dao.onchain.token as Address;

    // Get token info from Blockscout
    const tokenTransfers = await blockscoutService.getTokenTransfers(
      tokenAddress,
      undefined,
      100
    );

    // Calculate token metrics
    const uniqueHolders = new Set([
      ...tokenTransfers.map((t) => t.from),
      ...tokenTransfers.map((t) => t.to),
    ]);

    return {
      dao: {
        name: dao.name,
        tokenName: dao.tokenName,
        tokenSymbol: dao.tokenSymbol,
        initialSupply: dao.initialSupply,
      },
      onchain: {
        chainId: dao.onchain.chainId,
        tokenAddress: dao.onchain.token,
        factoryAddress: dao.onchain.factory,
        registryAddress: dao.onchain.registry,
        deployedAt: dao.onchain.deployedAt,
        txHash: dao.onchain.txHash,
        explorerUrl: blockscoutService.getExplorerLink('token', tokenAddress),
      },
      metrics: {
        totalTransfers: tokenTransfers.length,
        uniqueHolders: uniqueHolders.size,
        recentActivity: tokenTransfers.slice(0, 10),
      },
    };
  }

  /**
   * Get user's token balance and activity for a specific DAO
   * @param userAddress - User's wallet address
   * @param daoId - The DAO organization ID
   * @returns User's balance and activity
   */
  async getUserDaoActivity(userAddress: string, daoId: string) {
    await dbConnect();

    const dao = await Organization.findOne({ _id: daoId });
    if (!dao) {
      throw new Error(`DAO not found: ${daoId}`);
    }

    const address = userAddress as Address;

    // Get on-chain data if token is deployed
    let tokenBalance = '0';
    let tokenTransfers: TokenTransfer[] = [];

    if (dao.onchain?.token) {
      const tokenAddress = dao.onchain.token as Address;

      // Get token transfers for this user
      tokenTransfers = await blockscoutService.getTokenTransfers(
        address,
        tokenAddress,
        50
      );

      // Get address info including token balance
      const addressInfo = await blockscoutService.getAddressInfo(address);
      if (addressInfo?.tokenBalances) {
        const tokenBal = addressInfo.tokenBalances.find(
          (b) => b.token.address.toLowerCase() === tokenAddress.toLowerCase()
        );
        tokenBalance = tokenBal?.value || '0';
      }
    }

    // Get user's signal activity from database
    const signaledContent = await Content.find({
      daoId,
      'userSignals.userId': userAddress,
    }).lean();

    const userSignals = signaledContent.map((content) => {
      const userSignal = content.userSignals?.find(
        (s: any) => s.userId === userAddress
      );
      return {
        contentId: content._id,
        contentTitle: content.content?.title,
        contentType: content.type,
        amount: userSignal?.amount || '0',
        placedAt: userSignal?.placedAt,
        lastUpdatedAt: userSignal?.lastUpdatedAt,
      };
    });

    // Calculate total staked across all content
    const totalStaked = userSignals.reduce(
      (sum, signal) => sum + BigInt(signal.amount),
      BigInt(0)
    );

    return {
      user: {
        address: userAddress,
        daoId,
        daoName: dao.name,
      },
      tokens: {
        balance: tokenBalance,
        tokenName: dao.tokenName,
        tokenSymbol: dao.tokenSymbol,
        tokenAddress: dao.onchain?.token,
      },
      activity: {
        tokenTransfers: tokenTransfers.slice(0, 10),
        totalTransfers: tokenTransfers.length,
        signalActivity: userSignals,
        totalStaked: totalStaked.toString(),
        totalSignaledContent: signaledContent.length,
      },
    };
  }

  /**
   * Get on-chain proof/verification for a content item
   * @param contentId - The content ID
   * @returns On-chain verification data
   */
  async getContentOnChainProof(contentId: string) {
    await dbConnect();

    const content = await Content.findById(contentId).lean();
    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    // Type guard for content
    type ContentData = {
      daoId?: string;
      onchain?: { synced?: boolean; totalRaw?: string; totalQuadWeight?: string; supporters?: number };
      userSignals?: Array<{ userId: string; amount?: string; placedAt?: Date }>;
      content?: { title?: string };
      type?: string;
      authorId?: string;
      ipfs?: { cid?: string; pinned?: boolean };
    };
    const typedContent = content as unknown as ContentData;

    const dao = await Organization.findOne({ _id: typedContent.daoId });
    if (!dao) {
      throw new Error(`DAO not found: ${typedContent.daoId}`);
    }

    // Get signal registry contract logs for this content
    let contractLogs: unknown[] = [];
    if (dao.onchain?.registry && typedContent.onchain?.synced) {
      contractLogs = await blockscoutService.getContractLogs(
        dao.onchain.registry as Address,
        undefined,
        50
      );
    }

    // Get all users who have signaled this content
    const signalersAddresses = typedContent.userSignals?.map((s) => s.userId) || [];

    // Get on-chain activity for signalers
    const signalerActivity = await Promise.all(
      signalersAddresses.slice(0, 5).map(async (addr: string) => {
        const transfers = await blockscoutService.getTokenTransfers(
          addr as Address,
          dao.onchain?.token as Address,
          10
        );
        return {
          address: addr,
          recentTransfers: transfers.length,
        };
      })
    );

    return {
      content: {
        id: (content as { _id: unknown })._id,
        title: typedContent.content?.title,
        type: typedContent.type,
        author: typedContent.authorId,
      },
      dao: {
        name: dao.name,
        tokenSymbol: dao.tokenSymbol,
      },
      onchain: {
        synced: typedContent.onchain?.synced || false,
        lastSyncedAt: typedContent.onchain?.supporters,
        totalRaw: typedContent.onchain?.totalRaw || '0',
        totalQuadWeight: typedContent.onchain?.totalQuadWeight || '0',
        supporters: typedContent.onchain?.supporters || 0,
        registryAddress: dao.onchain?.registry,
        registryExplorerUrl: dao.onchain?.registry
          ? blockscoutService.getExplorerLink('address', dao.onchain.registry)
          : null,
      },
      signals: {
        totalSignals: typedContent.userSignals?.length || 0,
        signalers: signalersAddresses,
        topSignalers: typedContent.userSignals
          ?.sort((a, b) => {
            const aAmount = BigInt(a.amount || '0');
            const bAmount = BigInt(b.amount || '0');
            return aAmount > bAmount ? -1 : 1;
          })
          .slice(0, 5)
          .map((s) => ({
            userId: s.userId,
            amount: s.amount,
            placedAt: s.placedAt,
          })),
        signalerActivity: signalerActivity,
      },
      ipfs: typedContent.ipfs?.cid
        ? {
            cid: typedContent.ipfs.cid,
            pinned: typedContent.ipfs.pinned,
            gatewayUrl: `https://ipfs.io/ipfs/${typedContent.ipfs.cid}`,
          }
        : null,
    };
  }

  /**
   * Get governance token distribution for a DAO
   * @param daoId - The DAO organization ID
   * @returns Token distribution and holder information
   */
  async getTokenDistribution(daoId: string) {
    await dbConnect();

    const dao = await Organization.findOne({ _id: daoId });
    if (!dao || !dao.onchain?.token) {
      throw new Error(`DAO token not deployed: ${daoId}`);
    }

    const tokenAddress = dao.onchain.token as Address;

    // Get all token transfers
    const transfers = await blockscoutService.getTokenTransfers(
      tokenAddress,
      undefined,
      500
    );

    // Calculate holder balances from transfers
    const balances = new Map<string, bigint>();

    for (const transfer of transfers) {
      const fromBalance = balances.get(transfer.from.toLowerCase()) || BigInt(0);
      const toBalance = balances.get(transfer.to.toLowerCase()) || BigInt(0);
      const amount = BigInt(
        parseFloat(transfer.value) * Math.pow(10, transfer.token.decimals)
      );

      balances.set(transfer.from.toLowerCase(), fromBalance - amount);
      balances.set(transfer.to.toLowerCase(), toBalance + amount);
    }

    // Sort holders by balance
    const holders = Array.from(balances.entries())
      .map(([address, balance]) => ({
        address,
        balance: balance.toString(),
        percentage:
          (Number(balance) /
            Number(BigInt(dao.initialSupply || '0'))) *
          100,
      }))
      .filter((h) => BigInt(h.balance) > 0)
      .sort((a, b) => (BigInt(a.balance) > BigInt(b.balance) ? -1 : 1));

    return {
      dao: {
        name: dao.name,
        tokenName: dao.tokenName,
        tokenSymbol: dao.tokenSymbol,
        initialSupply: dao.initialSupply,
      },
      distribution: {
        totalHolders: holders.length,
        topHolders: holders.slice(0, 10),
        explorerUrl: blockscoutService.getExplorerLink('token', tokenAddress),
      },
    };
  }

  /**
   * Get recent signal/staking transactions for a DAO
   * @param daoId - The DAO organization ID
   * @param limit - Number of transactions to return
   * @returns Recent staking activity
   */
  async getRecentSignalActivity(daoId: string, limit: number = 20) {
    await dbConnect();

    const dao = await Organization.findOne({ _id: daoId });
    if (!dao) {
      throw new Error(`DAO not found: ${daoId}`);
    }

    // Get content with recent signal updates
    const recentlySignaledContent = await Content.find({
      daoId,
      'userSignals.0': { $exists: true },
    })
      .sort({ 'userSignals.lastUpdatedAt': -1 })
      .limit(limit)
      .lean();

    const activity = recentlySignaledContent.flatMap((content) => {
      return (content.userSignals || []).map((signal: any) => ({
        contentId: content._id,
        contentTitle: content.content?.title,
        contentType: content.type,
        userId: signal.userId,
        amount: signal.amount,
        placedAt: signal.placedAt,
        lastUpdatedAt: signal.lastUpdatedAt,
        onChainWeight: content.onchain?.totalQuadWeight,
      }));
    });

    // Sort by most recent
    activity.sort((a, b) => {
      const aTime = new Date(a.lastUpdatedAt || a.placedAt).getTime();
      const bTime = new Date(b.lastUpdatedAt || b.placedAt).getTime();
      return bTime - aTime;
    });

    return {
      dao: {
        name: dao.name,
        tokenSymbol: dao.tokenSymbol,
      },
      recentActivity: activity.slice(0, limit),
      stats: {
        totalSignals: activity.length,
        uniqueUsers: new Set(activity.map((a) => a.userId)).size,
      },
    };
  }

  /**
   * Verify on-chain data for agent responses
   * Provides verifiable links and transaction hashes
   * @param daoId - The DAO ID
   * @param contentId - Optional content ID
   * @returns Verifiable on-chain references
   */
  async getVerifiableReferences(daoId: string, contentId?: string) {
    await dbConnect();

    const dao = await Organization.findOne({ _id: daoId });
    if (!dao) {
      throw new Error(`DAO not found: ${daoId}`);
    }

    const references: any = {
      dao: {
        name: dao.name,
        factoryContract: dao.onchain?.factory
          ? {
              address: dao.onchain.factory,
              explorerUrl: blockscoutService.getExplorerLink(
                'address',
                dao.onchain.factory
              ),
            }
          : null,
        tokenContract: dao.onchain?.token
          ? {
              address: dao.onchain.token,
              explorerUrl: blockscoutService.getExplorerLink(
                'token',
                dao.onchain.token
              ),
            }
          : null,
        registryContract: dao.onchain?.registry
          ? {
              address: dao.onchain.registry,
              explorerUrl: blockscoutService.getExplorerLink(
                'address',
                dao.onchain.registry
              ),
            }
          : null,
        deploymentTx: dao.onchain?.txHash
          ? {
              hash: dao.onchain.txHash,
              explorerUrl: blockscoutService.getExplorerLink(
                'tx',
                dao.onchain.txHash
              ),
            }
          : null,
      },
    };

    if (contentId) {
      const content = await Content.findById(contentId).lean();
      if (content) {
        // Type guard for content
        type ContentData = {
          _id?: unknown;
          content?: { title?: string };
          type?: string;
          ipfs?: { cid?: string };
          onchain?: { synced?: boolean; totalRaw?: string; totalQuadWeight?: string };
        };
        const typedContent = content as unknown as ContentData;

        references.content = {
          id: typedContent._id,
          title: typedContent.content?.title,
          type: typedContent.type,
          ipfsCid: typedContent.ipfs?.cid,
          ipfsUrl: typedContent.ipfs?.cid
            ? `https://ipfs.io/ipfs/${typedContent.ipfs.cid}`
            : null,
          onChainSynced: typedContent.onchain?.synced,
          totalStaked: typedContent.onchain?.totalRaw,
          quadraticWeight: typedContent.onchain?.totalQuadWeight,
        };
      }
    }

    return references;
  }
}

// Export singleton instance
export const onChainService = new OnChainService();
