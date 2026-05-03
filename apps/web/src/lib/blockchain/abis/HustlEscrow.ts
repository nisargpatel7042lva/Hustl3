export const HustlEscrowABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "orderId", "type": "string" },
      { "internalType": "address", "name": "seller", "type": "address" },
      { "internalType": "string", "name": "keeperHubJobId", "type": "string" }
    ],
    "name": "createEscrowETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "orderId", "type": "string" }],
    "name": "releaseEscrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "orderId", "type": "string" }],
    "name": "refundEscrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "orderId", "type": "string" }],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
