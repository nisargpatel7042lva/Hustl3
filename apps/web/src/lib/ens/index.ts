import { ethers } from 'ethers';

// Read provider URL from env
const providerUrl = process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';
const provider = new ethers.JsonRpcProvider(providerUrl);

// In production, this uses the real ENS PublicResolver ABI
const RESOLVER_ABI = [
  "function setText(bytes32 node, string key, string value) external"
];

export async function updateAgentEnsRecord(
  agentAddress: string, 
  ensName: string, 
  tier: number, 
  blueprintHash?: string
) {
  try {
    // 1. Get resolver for the ENS name
    const resolverAddress = await provider.getResolver(ensName);
    if (!resolverAddress) {
      console.warn(`No resolver found for ${ensName}`);
      return false;
    }

    if (!process.env.PRIVATE_KEY) {
       console.warn('PRIVATE_KEY not set. Cannot update ENS record.');
       return false;
    }

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const resolverContract = new ethers.Contract(resolverAddress.address, RESOLVER_ABI, signer);
    
    const node = ethers.namehash(ensName);
    
    console.log(`[ENS] Updating text records for ${ensName}...`);
    
    // In production we wait for the transaction to complete
    let tx = await resolverContract.setText(node, 'com.hustl3.agentTier', tier.toString());
    await tx.wait();

    if (blueprintHash) {
      tx = await resolverContract.setText(node, 'com.hustl3.blueprintHash', blueprintHash);
      await tx.wait();
    }

    return true;
  } catch (err) {
    console.error('ENS Text Record Update Failed:', err);
    return false;
  }
}
