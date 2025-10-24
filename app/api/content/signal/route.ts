// app/api/content/signal/route.ts
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import Organization from "@/models/Organization";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";

/**
 * POST /api/content/signal - Sync on-chain signal data to database
 * This endpoint is called AFTER a signal transaction is confirmed on-chain
 * to update the database with the latest signal data.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      contentId,
      daoId,
      totalRaw,
      totalQuadWeight,
      supporters,
      txHash,
      userAmount, // Amount placed/withdrawn by this specific user
    } = body;

    // Validate required fields
    if (
      !contentId ||
      !daoId ||
      totalRaw === undefined ||
      totalQuadWeight === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify the DAO exists
    const dao = await Organization.findById(daoId);
    if (!dao) {
      return NextResponse.json({ error: "DAO not found" }, { status: 404 });
    }

    // Find and update the content
    const content = await Content.findById(contentId);
    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Verify the content belongs to the specified DAO
    if (content.daoId !== daoId) {
      return NextResponse.json(
        { error: "Content does not belong to this DAO" },
        { status: 400 }
      );
    }

    // Update on-chain data
    content.onchain = {
      synced: true,
      lastSyncedAt: new Date(),
      totalRaw: totalRaw.toString(),
      totalQuadWeight: totalQuadWeight.toString(),
      supporters: supporters || 0,
    };

    // Also update the deprecated counters for backward compatibility
    content.counters = {
      ...content.counters,
      placedRaw: totalRaw.toString(),
      qWeight: totalQuadWeight.toString(),
    };

    // Update user-specific signal if userAmount is provided
    if (userAmount !== undefined && user.walletAddress) {
      const userId = user.walletAddress;
      const existingSignalIndex = content.userSignals?.findIndex(
        (s: any) => s.userId === userId
      );

      const newAmount = userAmount.toString();
      const isWithdrawal = newAmount.startsWith("-");
      const absoluteAmount = isWithdrawal ? newAmount.slice(1) : newAmount;

      if (existingSignalIndex !== undefined && existingSignalIndex >= 0) {
        // Update existing signal
        const currentAmount = BigInt(
          content.userSignals[existingSignalIndex].amount || "0"
        );
        const changeAmount = BigInt(absoluteAmount);
        const updatedAmount = isWithdrawal
          ? currentAmount - changeAmount
          : currentAmount + changeAmount;

        content.userSignals[existingSignalIndex].amount =
          updatedAmount.toString();
        content.userSignals[existingSignalIndex].lastUpdatedAt = new Date();
      } else if (!isWithdrawal) {
        // Add new signal (only if not a withdrawal)
        if (!content.userSignals) {
          content.userSignals = [];
        }
        content.userSignals.push({
          userId,
          amount: absoluteAmount,
          placedAt: new Date(),
          lastUpdatedAt: new Date(),
        });
      }
    }

    content.lastActivityAt = new Date();

    await content.save();

    return NextResponse.json({
      success: true,
      content,
      txHash,
    });
  } catch (error) {
    console.error("Error syncing signal data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/content/signal?contentId=xxx - Get signal data for content
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const content = await Content.findById(contentId);
    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      contentId: content._id,
      onchain: content.onchain,
      ipfs: content.ipfs,
    });
  } catch (error) {
    console.error("Error fetching signal data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
