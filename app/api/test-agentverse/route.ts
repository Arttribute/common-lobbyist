import { NextResponse } from "next/server";

/**
 * GET /api/test-agentverse
 * Direct test of environment variable without any middleware
 */
export async function GET() {
  // Direct check
  const apiKey = process.env.AGENTVERSE_API_KEY;

  console.log('=== AGENTVERSE DEBUG ===');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key type:', typeof apiKey);
  console.log('process.env keys containing AGENT:', Object.keys(process.env).filter(k => k.includes('AGENT')));
  console.log('========================');

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    checks: {
      'process.env.AGENTVERSE_API_KEY exists': !!apiKey,
      'process.env.AGENTVERSE_API_KEY type': typeof apiKey,
      'process.env.AGENTVERSE_API_KEY length': apiKey?.length || 0,
      'Boolean check (!!apiKey)': !!apiKey,
      'Negation check (!apiKey)': !apiKey,
      'undefined check (apiKey === undefined)': apiKey === undefined,
      'empty string check (apiKey === "")': apiKey === '',
    },
    allAgentverseEnvVars: Object.keys(process.env)
      .filter(k => k.toLowerCase().includes('agent'))
      .reduce((acc, key) => {
        acc[key] = process.env[key] ? `SET (${process.env[key]?.length} chars)` : 'NOT SET';
        return acc;
      }, {} as Record<string, string>),
  });
}
