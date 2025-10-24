/**
 * Agent Tools - Blockchain Explorer Integration
 *
 * Provides tools for the agent to query blockchain data via Blockscout.
 * These tools allow the agent to give users real-time information about
 * DAO signals, token activity, and on-chain governance.
 */

import { Address } from "viem";
import { blockscoutService } from "./blockscout";
import Content from "@/models/Content";
import Organization from "@/models/Organization";
import dbConnect from "@/lib/dbConnect";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: string[];
      }
    >;
    required: string[];
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Tool definitions that describe what the agent can do
 */
export const agentTools: ToolDefinition[] = [
  {
    name: "get_content_signals",
    description:
      "Get the on-chain signal history for a specific post or comment. Shows who signaled, how much token weight, and transaction links.",
    parameters: {
      type: "object",
      properties: {
        contentId: {
          type: "string",
          description: "The ID of the post or comment",
        },
      },
      required: ["contentId"],
    },
  },
  {
    name: "get_top_signaled_content",
    description:
      "Get the top signaled content in the DAO forum, ranked by total signal weight. Useful for showing what the community values most.",
    parameters: {
      type: "object",
      properties: {
        organizationId: {
          type: "string",
          description: "The DAO/organization ID",
        },
        limit: {
          type: "string",
          description: "Number of items to return (default: 10)",
        },
      },
      required: ["organizationId"],
    },
  },
  {
    name: "get_user_signal_activity",
    description:
      "Get a user's signal activity - what they've signaled and how much token weight they've placed.",
    parameters: {
      type: "object",
      properties: {
        walletAddress: {
          type: "string",
          description: "The user's wallet address",
        },
        organizationId: {
          type: "string",
          description: "The DAO/organization ID",
        },
      },
      required: ["walletAddress", "organizationId"],
    },
  },
  {
    name: "get_token_transfers",
    description:
      "Get recent token transfers for the DAO's governance token. Useful for understanding token distribution and activity.",
    parameters: {
      type: "object",
      properties: {
        tokenAddress: {
          type: "string",
          description: "The token contract address",
        },
        limit: {
          type: "string",
          description: "Number of transfers to return (default: 20)",
        },
      },
      required: ["tokenAddress"],
    },
  },
  {
    name: "get_transaction_details",
    description:
      "Get detailed information about a specific transaction, including status, value, and explorer link.",
    parameters: {
      type: "object",
      properties: {
        txHash: {
          type: "string",
          description: "The transaction hash",
        },
      },
      required: ["txHash"],
    },
  },
];

/**
 * Execute a tool call
 */
export async function executeTool(
  toolName: string,
  args: Record<string, any>
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "get_content_signals":
        return await getContentSignals(args.contentId);

      case "get_top_signaled_content":
        return await getTopSignaledContent(
          args.organizationId,
          parseInt(args.limit || "10")
        );

      case "get_user_signal_activity":
        return await getUserSignalActivity(
          args.walletAddress,
          args.organizationId
        );

      case "get_token_transfers":
        return await getTokenTransfers(
          args.tokenAddress,
          parseInt(args.limit || "20")
        );

      case "get_transaction_details":
        return await getTransactionDetails(args.txHash);

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error: any) {
    console.error(`Error executing tool ${toolName}:`, error);
    return {
      success: false,
      error: error.message || "Tool execution failed",
    };
  }
}

/**
 * Tool implementations
 */

async function getContentSignals(contentId: string): Promise<ToolResult> {
  try {
    await dbConnect();

    const content = await Content.findById(contentId);
    if (!content) {
      return {
        success: false,
        error: "Content not found",
      };
    }

    const signals = content.userSignals || [];
    const totalSignal = content.onchain?.totalRaw || content.counters?.placedRaw || "0";

    // Get transaction details for recent signals
    const recentSignals = signals.slice(0, 5).map((signal: any) => ({
      user: signal.userId,
      amount: signal.amount,
      weight: signal.weight,
      explorerLink: blockscoutService.getExplorerLink(
        "address",
        signal.userId
      ),
    }));

    return {
      success: true,
      data: {
        contentId: content._id,
        contentType: content.type,
        title: content.content?.title || "Comment",
        totalSignals: totalSignal,
        signalCount: signals.length,
        recentSignals,
        explorerLink: content.onchain?.registryAddress
          ? blockscoutService.getExplorerLink(
              "address",
              content.onchain.registryAddress as Address
            )
          : null,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getTopSignaledContent(
  organizationId: string,
  limit: number
): Promise<ToolResult> {
  try {
    await dbConnect();

    const contents = await Content.find({
      organizationId,
    })
      .sort({ "onchain.totalRaw": -1, "counters.placedRaw": -1 })
      .limit(limit)
      .lean();

    const topContent = contents.map((content: any) => ({
      id: content._id,
      type: content.type,
      title: content.content?.title || content.content?.text?.substring(0, 100),
      totalSignals: content.onchain?.totalRaw || content.counters?.placedRaw || "0",
      signalCount: content.userSignals?.length || 0,
      author: content.authorId,
      createdAt: content.createdAt,
    }));

    return {
      success: true,
      data: {
        organizationId,
        topContent,
        totalItems: contents.length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getUserSignalActivity(
  walletAddress: string,
  organizationId: string
): Promise<ToolResult> {
  try {
    await dbConnect();

    // Find all content where this user has signaled
    const contents = await Content.find({
      organizationId,
      "userSignals.userId": walletAddress.toLowerCase(),
    }).lean();

    const signals = contents
      .map((content: any) => {
        const userSignal = content.userSignals?.find(
          (s: any) => s.userId.toLowerCase() === walletAddress.toLowerCase()
        );
        return {
          contentId: content._id,
          contentType: content.type,
          title: content.content?.title || content.content?.text?.substring(0, 100),
          signalAmount: userSignal?.amount || "0",
          signalWeight: userSignal?.weight || "0",
        };
      })
      .filter((s) => s.signalAmount !== "0");

    // Get user's token balance from Blockscout
    const addressInfo = await blockscoutService.getAddressInfo(
      walletAddress as Address
    );

    return {
      success: true,
      data: {
        walletAddress,
        signals,
        totalSignals: signals.length,
        tokenBalance: addressInfo?.tokenBalances?.[0]?.value || "0",
        explorerLink: blockscoutService.getExplorerLink(
          "address",
          walletAddress
        ),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getTokenTransfers(
  tokenAddress: string,
  limit: number
): Promise<ToolResult> {
  try {
    const transfers = await blockscoutService.getTokenTransfers(
      tokenAddress as Address,
      undefined,
      limit
    );

    return {
      success: true,
      data: {
        tokenAddress,
        transfers: transfers.map((t) => ({
          from: t.from,
          to: t.to,
          value: t.value,
          timestamp: t.timestamp,
          token: t.token,
          explorerLink: blockscoutService.getExplorerLink("tx", t.hash),
        })),
        totalTransfers: transfers.length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getTransactionDetails(txHash: string): Promise<ToolResult> {
  try {
    const tx = await blockscoutService.getTransaction(txHash);

    if (!tx) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      data: tx,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
