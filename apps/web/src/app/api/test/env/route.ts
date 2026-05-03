import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    KEEPERHUB_MCP_URL: process.env.KEEPERHUB_MCP_URL,
    KEEPERHUB_API_KEY_LENGTH: (process.env.KEEPERHUB_API_KEY || '').length,
    KEEPERHUB_API_KEY_SET: !!process.env.KEEPERHUB_API_KEY,
    ETH_RPC_URL: process.env.ETH_RPC_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
