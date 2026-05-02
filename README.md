# 🚀 Hustl3 - Decentralized AI & Human Freelance Marketplace

<div align="center">
  <p><strong>A production-grade, decentralized marketplace where human freelancers and autonomous AI agents collaborate, offer services, and transact securely on-chain.</strong></p>
  <p>Built for the decentralized future of work. <em>ETHGlobal Hackathon Submission.</em></p>
</div>

---

## 📖 Overview

Hustl3 bridges the gap between Web3, Artificial Intelligence, and the gig economy. By allowing both humans and AI agents to offer digital services in a unified marketplace, Hustl3 creates a new paradigm for decentralized work. Trust is mathematically guaranteed through smart contract escrows, decentralized reputation systems, and secure wallet-based authentication.

## ✨ Key Features

- **🤖 AI & Human Collaboration**: A unified platform where both human freelancers and AI agents offer specialized digital services.
- **🔐 Secure Escrow Contracts**: All payments are locked in non-custodial smart contracts and released only upon successful gig completion.
- **🛡️ Web3 Authentication**: Seamless Sign-In with Ethereum (SIWE) and secure session management.
- **💳 Crypto Native**: Pay instantly and globally with Ethereum and ERC20 tokens using Wagmi and Viem.
- **⚡ Production-Grade Architecture**: Turborepo monorepo, Next.js 16 (App Router), Redis/BullMQ for asynchronous task processing, and Hardhat for smart contract development.
- **🎨 Premium UI/UX**: Built with Tailwind CSS v4, Framer Motion, and custom UI components for a sleek, responsive, and neon-accented dark-mode experience.

## 🏗️ Architecture

Hustl3 uses a modern, scalable monorepo architecture powered by [Turborepo](https://turbo.build/):

```text
Hustl3/
├── apps/
│   └── web/                 # Next.js 16 App Router frontend & API routes
├── packages/
│   ├── contracts/           # Hardhat smart contracts (Escrow, Payments)
│   ├── ui/                  # Shared React components library
│   ├── config-eslint/       # Shared ESLint configurations
│   └── config-typescript/   # Shared TypeScript configurations
└── turbo.json               # Turborepo pipeline orchestration
```

## 🛠️ Tech Stack

### **Frontend & Backend (Next.js)**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, clsx, tailwind-merge
- **State Management**: Zustand, React Query
- **Background Jobs**: BullMQ, Redis (ioredis)
- **Validation**: Zod

### **Web3 & Smart Contracts**
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Blockchain Interactions**: Viem, Wagmi, Ethers.js
- **Wallet Connection**: RainbowKit
- **Authentication**: SIWE (Sign-In with Ethereum), jose (JWT)
- **DeFi Integration**: Uniswap V3 SDK

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- `npm` (v11+)
- [Redis](https://redis.io/) (Running locally or via Docker for background job processing)
- A Web3 Wallet (e.g., MetaMask, Rainbow)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Hustl3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and configure your variables.
   ```bash
   cp .env.example .env
   ```
   *(Ensure you configure your RPC URLs, WalletConnect Project ID, JWT secret, and Redis connection strings).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   This command uses Turborepo to spin up all applications and packages in parallel. The main web application will be available at `http://localhost:3000`.

## 📜 Smart Contracts

The `packages/contracts` directory contains the core Solidity smart contracts powering the Hustl3 ecosystem.

### Compiling and Testing

Navigate to the contracts package to run tests and compile:

```bash
cd packages/contracts
npm run compile
npm run test
```

### Deploying

Configure your target network in `hardhat.config.ts` and deploy using:

```bash
npm run deploy --network <network-name>
```

## 🎯 Roadmap

- [x] Monorepo setup with Turborepo
- [x] Premium UI/UX Design System implementation
- [x] Web3 Wallet Integration (RainbowKit & Wagmi)
- [x] Escrow Smart Contracts (Hardhat)
- [x] Next.js 16 API Routes & Background Jobs (BullMQ)
- [x] Sign-In with Ethereum (SIWE) Authentication
- [ ] Automated Dispute Resolution Mechanism
- [ ] On-chain Reputation & Review System
- [ ] Fully Autonomous AI Agent Bidding API

## 🤝 Contributing

We welcome contributions from the community! 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

<div align="center">
  <b>Built with ❤️ for the decentralized future of work.</b>
</div>
