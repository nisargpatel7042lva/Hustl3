/**
 * x402 Payment Rail.
 * Issues HTTP 402 payment challenges with cryptographic signatures.
 * Backend independently verifies all transactions on-chain — never trusts client claims.
 */
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';

const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || '';
const ESCROW_CONTRACT      = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '';

export interface X402Challenge {
  orderId:   string;
  amount:    string;       // in token smallest unit (wei or USDC base units)
  token:     string;       // contract address or "native"
  recipient: string;       // escrow contract address
  chainId:   number;
  nonce:     string;
  expiresAt: number;       // unix timestamp
  signature: string;       // operator signature over all fields
}

export interface X402Confirmation {
  orderId:   string;
  txHash:    string;
  chainId:   number;
  payer:     string;
}

export interface X402VerifyResult {
  valid:          boolean;
  amount:         bigint;
  token:          string;
  from:           string;
  to:             string;
  blockNumber:    number;
  blockTimestamp: number;
}

/**
 * Issue an x402 payment challenge.
 */
export async function issueX402Challenge(
  orderId:  string,
  amount:   bigint,
  token:    string,
  chainId:  number,
): Promise<X402Challenge> {
  const nonce     = randomBytes(16).toString('hex');
  const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 minutes

  const wallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY);
  const message = ethers.solidityPackedKeccak256(
    ['string', 'string', 'uint256', 'address', 'uint256', 'string', 'uint256'],
    [orderId, amount.toString(), chainId, ESCROW_CONTRACT, chainId, nonce, expiresAt],
  );
  const signature = await wallet.signMessage(ethers.getBytes(message));

  return {
    orderId,
    amount:    amount.toString(),
    token,
    recipient: ESCROW_CONTRACT,
    chainId,
    nonce,
    expiresAt,
    signature,
  };
}

/**
 * Verify an x402 payment confirmation by fetching the transaction independently.
 * NEVER trust the client's claim — always verify on-chain.
 */
export async function verifyX402Payment(
  confirmation: X402Confirmation,
  expectedAmount: bigint,
  expectedToken:  string,
  buyerAddress:   string,
): Promise<X402VerifyResult> {
  const rpcUrl = getRpcForChain(confirmation.chainId);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const receipt = await provider.getTransactionReceipt(confirmation.txHash);
  if (!receipt) throw new Error('Transaction not found on-chain');

  const tx = await provider.getTransaction(confirmation.txHash);
  if (!tx) throw new Error('Transaction not found');

  // Verify recipient is the escrow contract
  const normalizedTo = (tx.to ?? '').toLowerCase();
  if (normalizedTo !== ESCROW_CONTRACT.toLowerCase()) {
    throw new Error(`Transaction recipient mismatch: got ${tx.to}, expected ${ESCROW_CONTRACT}`);
  }

  // Verify from address matches buyer
  const normalizedFrom = (tx.from ?? '').toLowerCase();
  if (normalizedFrom !== buyerAddress.toLowerCase()) {
    throw new Error(`Transaction sender mismatch: got ${tx.from}, expected ${buyerAddress}`);
  }

  const block = await provider.getBlock(receipt.blockNumber);

  if (expectedToken === 'native' || expectedToken === ethers.ZeroAddress) {
    // Native ETH transfer — verify tx.value
    if (tx.value < expectedAmount) {
      throw new Error(`Amount mismatch: got ${tx.value}, expected ${expectedAmount}`);
    }
    return {
      valid:          true,
      amount:         tx.value,
      token:          ethers.ZeroAddress,
      from:           tx.from,
      to:             tx.to ?? '',
      blockNumber:    receipt.blockNumber,
      blockTimestamp: block?.timestamp ?? 0,
    };
  } else {
    // ERC-20 transfer — parse Transfer event logs
    const ERC20_TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');
    const log = receipt.logs.find(
      l =>
        l.address.toLowerCase() === expectedToken.toLowerCase() &&
        l.topics[0] === ERC20_TRANSFER_TOPIC &&
        l.topics[2]?.toLowerCase().includes(ESCROW_CONTRACT.slice(2).toLowerCase()),
    );

    if (!log) throw new Error('ERC-20 Transfer event not found in transaction');

    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], log.data);
    const transferredAmount = decoded[0] as bigint;

    if (transferredAmount < expectedAmount) {
      throw new Error(`ERC-20 amount mismatch: got ${transferredAmount}, expected ${expectedAmount}`);
    }

    return {
      valid:          true,
      amount:         transferredAmount,
      token:          expectedToken,
      from:           tx.from,
      to:             ESCROW_CONTRACT,
      blockNumber:    receipt.blockNumber,
      blockTimestamp: block?.timestamp ?? 0,
    };
  }
}

function getRpcForChain(chainId: number): string {
  const map: Record<number, string> = {
    1:       process.env.ETH_RPC_URL   || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    8453:    process.env.BASE_RPC_URL  || 'https://mainnet.base.org',
    16600:   process.env.ZEROG_RPC_URL || 'https://rpc.0g.ai',
    84532:   process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  };
  return map[chainId] ?? map[1]!;
}
