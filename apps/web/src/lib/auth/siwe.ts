/**
 * SIWE (Sign-In With Ethereum) authentication service.
 * Issues JWT access tokens (15min) + refresh tokens (7 days).
 * Nonces stored in memory cache with 5-minute TTL (Redis in production).
 */
import { SiweMessage } from 'siwe';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';
import { kvGet } from '@/lib/storage/zerog';

const JWT_SECRET  = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hustl3-dev-secret-change-in-production-min-512-bits',
);
const JWT_ISSUER  = 'hustl3.xyz';
const JWT_AUDIENCE = 'hustl3-app';

export interface JwtPayload {
  sub:         string; // wallet address
  ensName?:    string;
  accountType: 'human' | 'agent';
  chainId:     number;
  iat?:        number;
  exp?:        number;
}

// In-memory nonce store (replace with Redis in production)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

// Clean up expired nonces periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of nonceStore) {
      if (val.expiresAt < now) nonceStore.delete(key);
    }
  }, 60_000);
}

export function generateNonce(walletAddress: string): string {
  const nonce = randomBytes(16).toString('hex');
  nonceStore.set(walletAddress.toLowerCase(), {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
  return nonce;
}

export function getNonce(walletAddress: string): string | null {
  const entry = nonceStore.get(walletAddress.toLowerCase());
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.nonce;
}

export function consumeNonce(walletAddress: string): string | null {
  const nonce = getNonce(walletAddress);
  if (nonce) nonceStore.delete(walletAddress.toLowerCase());
  return nonce;
}

export interface VerifyResult {
  address:     string;
  chainId:     number;
  ensName?:    string;
  accountType: 'human' | 'agent';
}

export async function verifySiweSignature(
  message: string,
  signature: string,
): Promise<VerifyResult> {
  const siwe = new SiweMessage(message);
  const result = await siwe.verify({ signature });

  if (!result.success) {
    throw new Error(result.error?.type ?? 'SIWE verification failed');
  }

  const address = siwe.address.toLowerCase();
  const stored  = consumeNonce(address);
  if (!stored || stored !== siwe.nonce) {
    throw new Error('Invalid or expired nonce');
  }

  // Determine account type by checking 0G Storage
  const agentProfile = await kvGet<{ accountType?: string }>(`agents:${address}:profile`);
  const accountType  = agentProfile ? 'agent' : 'human';

  return {
    address,
    chainId:     siwe.chainId ?? 1,
    accountType: accountType as 'human' | 'agent',
  };
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(address: string): Promise<string> {
  return new SignJWT({ sub: address, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer:   JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  return payload as unknown as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer:   JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  if ((payload as { type?: string }).type !== 'refresh') {
    throw new Error('Not a refresh token');
  }
  return { sub: payload.sub as string };
}

// In-memory revocation list (replace with Redis SET in production)
const revokedTokens = new Set<string>();

export function revokeRefreshToken(token: string): void {
  revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}
