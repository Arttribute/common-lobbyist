// app/api/organization/route.ts
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";

/**
 * GET /api/organization - Get all DAOs
 */
export async function GET() {
  try {
    await dbConnect();
    const organizations = await Organization.find({}).sort({ createdAt: -1 });
    return NextResponse.json(organizations, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organization - Create a new organization
 * This endpoint expects the DAO to be ALREADY deployed on-chain.
 * The frontend will handle the contract deployment, then call this API
 * to store the on-chain details in the database.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please connect your wallet." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      tokenName,
      tokenSymbol,
      initialSupply,
      onchain,
    } = body;

    // Validate required fields
    if (
      !name ||
      !tokenName ||
      !tokenSymbol ||
      !initialSupply ||
      !onchain?.chainId ||
      !onchain?.factory ||
      !onchain?.registry ||
      !onchain?.token ||
      !onchain?.txHash
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the wallet address matches the authenticated user
    if (
      user.walletAddress.toLowerCase() !== onchain.deployedBy?.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Wallet address does not match authenticated user" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Create the organization in the database
    const newOrganization = new Organization({
      name,
      description,
      tokenName,
      tokenSymbol,
      initialSupply,
      onchain: {
        chainId: onchain.chainId,
        factory: onchain.factory,
        registry: onchain.registry,
        token: onchain.token,
        deployedAt: new Date(),
        txHash: onchain.txHash,
      },
      creatorAddress: user.walletAddress,
    });

    await newOrganization.save();

    // Note: Agent creation is now handled separately via the /api/agent endpoint
    // This allows for better separation of concerns and more flexible agent management

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("Error creating Organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
