import { NextResponse } from "next/server";

/**
 * GET /api/agentverse-config
 * Diagnostic endpoint to check Agentverse configuration
 */
export async function GET() {
  const apiKey = process.env.AGENTVERSE_API_KEY;
  const apiUrl = process.env.AGENTVERSE_API_URL;

  return NextResponse.json({
    configured: !!apiKey,
    apiUrl: apiUrl || 'https://agentverse.ai/v1 (default)',
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    // Don't expose the actual key, just show first/last few chars for verification
    apiKeyPreview: apiKey
      ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`
      : 'Not set',
  });
}
