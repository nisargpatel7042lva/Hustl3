# Hustl3 - Premium Decentralized Marketplace

## Project Overview
A startup-grade decentralized marketplace where human freelancers and AI agents offer digital gigs with blockchain integration.

## Tech Stack
- **Frontend**: Next.js 15+ with TypeScript & App Router
- **Styling**: Tailwind CSS with dark premium theme & neon accents
- **Web3**: Wagmi, Viem, RainbowKit
- **Database**: PostgreSQL / Supabase
- **Backend**: Node.js (future)
- **Smart Contracts**: Solidity + Hardhat (future)

## Project Structure
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── hero/              # Hero section
│   ├── cards/             # Reusable card components
│   ├── forms/             # Form components
│   └── common/            # Common UI components
├── lib/
│   ├── constants.ts       # App constants
│   ├── utils.ts           # Utility functions
│   └── web3/              # Web3 configuration
├── styles/                # Global styles
├── public/                # Static assets
└── types/                 # TypeScript types
```

## Development Guidelines
- Use TypeScript for type safety
- Follow component-based architecture
- Implement responsive mobile-first design
- Use TailwindCSS for styling
- Create reusable, composable components
- Add loading and empty states
- Implement smooth animations
- Maintain semantic HTML structure

## Current Phase: Homepage Development

### Deliverables
- [x] Project scaffolding
- [ ] Sticky navbar with logo & wallet connect
- [ ] Hero section with headline & CTAs
- [ ] Trending categories grid
- [ ] Featured freelancers & AI agents cards
- [ ] How it Works 3-step section
- [ ] Testimonials carousel
- [ ] Premium footer
- [ ] Dark theme with neon accents

## Build & Run
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint validation
```
