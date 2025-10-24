// app/api/organization/[organizationId]/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { getUserTokenBalance } from "@/lib/contracts/governance-token";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

/**
 * GET /api/organization/[organizationId]/balance
 * Get the authenticated user's token balance for a specific DAO
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the DAO
    const dao = await Organization.findById(organizationId);
    if (!dao) {
      return NextResponse.json({ error: "DAO not found" }, { status: 404 });
    }

    // Get on-chain token balance
    const balance = await getUserTokenBalance(
      dao.onchain.chainId,
      dao.onchain.token,
      user.walletAddress
    );

    return NextResponse.json({
      organizationId: dao._id,
      tokenAddress: dao.onchain.token,
      tokenName: dao.tokenName,
      tokenSymbol: dao.tokenSymbol,
      balance: balance.toString(),
      userAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
