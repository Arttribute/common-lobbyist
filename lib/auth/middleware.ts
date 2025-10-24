// lib/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";

// Initialize Privy server client
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
}
if (!process.env.PRIVY_APP_SECRET) {
  throw new Error(
    "PRIVY_APP_SECRET is not set. Please add it to your .env.local file. You can find it in your Privy dashboard at https://dashboard.privy.io"
  );
}

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  walletAddress?: string;
}

/**
 * Middleware to verify Privy JWT tokens and authenticate requests
 * Use this in API routes that require authentication
 */
export async function withAuth(
  request: NextRequest,
  handler: (
    req: AuthenticatedRequest
  ) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);

    // Verify the token with Privy
    const verifiedClaims = await privyClient.verifyAuthToken(token);

    // Attach user info to the request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.userId = verifiedClaims.userId;

    // Get the user's wallet address from Privy
    const user = await privyClient.getUser(verifiedClaims.userId);
    const wallet = user.linkedAccounts.find(
      (account: { type: string; address?: string }) => account.type === "wallet"
    );

    if (wallet && wallet.type === "wallet") {
      authenticatedRequest.walletAddress = wallet.address;
    }

    // Call the handler with the authenticated request
    return await handler(authenticatedRequest);
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Invalid or expired authentication token" },
      { status: 401 }
    );
  }
}

/**
 * Get the authenticated user from a request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<{
  userId: string;
  walletAddress?: string;
} | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const verifiedClaims = await privyClient.verifyAuthToken(token);

    const user = await privyClient.getUser(verifiedClaims.userId);
    const wallet = user.linkedAccounts.find(
      (account: { type: string; address?: string }) => account.type === "wallet"
    );

    return {
      userId: verifiedClaims.userId,
      walletAddress:
        wallet && wallet.type === "wallet" ? wallet.address : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Verify that the authenticated user owns a specific wallet address
 */
export async function verifyWalletOwnership(
  request: NextRequest,
  walletAddress: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(request);

  if (!user || !user.walletAddress) {
    return false;
  }

  return user.walletAddress.toLowerCase() === walletAddress.toLowerCase();
}
