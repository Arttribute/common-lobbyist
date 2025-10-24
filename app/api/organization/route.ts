// app/api/organization/route.ts
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { agentCommonsService } from "@/lib/services/agentcommons";

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
      agent: agentConfig,
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

    // Create an agent for this DAO
    try {
      const agentPersona =
        agentConfig?.persona ||
        agentCommonsService.getDefaultPersona(name);
      const agentInstructions =
        agentConfig?.instructions ||
        agentCommonsService.getDefaultInstructions(name);

      const agent = await agentCommonsService.createAgent({
        name: `${name} Community Agent`,
        persona: agentPersona,
        instructions: agentInstructions,
        owner: user.walletAddress,
        temperature: agentConfig?.temperature || 0.7,
        maxTokens: agentConfig?.maxTokens || 2000,
        topP: agentConfig?.topP || 1,
        presencePenalty: agentConfig?.presencePenalty || 0,
        frequencyPenalty: agentConfig?.frequencyPenalty || 0,
        commonsOwned: false,
      });

      // Update the organization with agent details
      newOrganization.agent = {
        agentId: agent.agentId,
        enabled: true,
        persona: agentPersona,
        instructions: agentInstructions,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        topP: agent.topP,
        presencePenalty: agent.presencePenalty,
        frequencyPenalty: agent.frequencyPenalty,
        createdAt: new Date(),
      };

      await newOrganization.save();
    } catch (agentError) {
      console.error("Error creating agent for DAO:", agentError);
      // Don't fail the DAO creation if agent creation fails
      // The agent can be created later via settings
    }

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("Error creating Organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
