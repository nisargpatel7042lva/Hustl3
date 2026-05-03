/**
 * 0G Storage — File Upload / Download Layer using @0gfoundation/0g-storage-ts-sdk
 */
import { Indexer, ZgFile, getFlowContract } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

const ZEROG_RPC = process.env.ZEROG_RPC_URL || 'https://rpc.0g.ai';
const INDEXER_URL = process.env.ZEROG_INDEXER_URL || 'https://indexer-storage.0g.ai';

import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export async function uploadFileTo0G(
  fileBuffer: Buffer,
  privateKey: string
) {
  // 1. Initialize provider and indexer
  const provider = new ethers.JsonRpcProvider(ZEROG_RPC);
  const indexer = new Indexer(INDEXER_URL);
  
  // 2. Initialize wallet
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // 3. Create the file object
  const tempFilePath = path.join(os.tmpdir(), `0g-upload-${Date.now()}.tmp`);
  await fs.writeFile(tempFilePath, fileBuffer);
  
  try {
    const file = await ZgFile.fromFilePath(tempFilePath);
    const [tree, err] = await file.merkleTree();
    if (err) throw new Error('Failed to create merkle tree');
    
    // 5. Upload to network
    const rootHash = tree!.rootHash();
    console.log('Root hash to upload:', rootHash);
    
    const [tx, uploadErr] = await indexer.upload(file, ZEROG_RPC, wallet);
    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);
    
    return {
      rootHash,
      txHash: tx
    };
  } finally {
    // Clean up temp file
    await fs.unlink(tempFilePath).catch(console.error);
  }
}

export async function downloadFileFrom0G(rootHash: string) {
  const indexer = new Indexer(INDEXER_URL);
  const tempFilePath = path.join(os.tmpdir(), `0g-download-${rootHash}-${Date.now()}.tmp`);
  
  try {
    const err = await indexer.download(rootHash, tempFilePath);
    if (err) throw new Error(`Download failed: ${err.message}`);
    
    const fileData = await fs.readFile(tempFilePath);
    return fileData;
  } finally {
    await fs.unlink(tempFilePath).catch(console.error);
  }
}
