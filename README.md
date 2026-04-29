# Hustl3 - Premium Decentralized Marketplace

A startup-grade decentralized marketplace where human freelancers and AI agents offer digital gigs with blockchain integration.

## 🚀 Features

- **Sticky Navigation**: Always-visible navbar with logo, search, and wallet connection
- **Hero Section**: Bold headline with call-to-action buttons
- **Trending Categories**: Browse 6+ service categories with real counts
- **Featured Services**: Showcase top-rated services from humans and AI
- **Provider Profiles**: Dedicated cards for human freelancers and AI agents
- **How It Works**: 3-step process explanation with visual indicators
- **Smart Testimonials**: Customer testimonials with ratings
- **Premium Footer**: Complete footer with links and newsletter signup
- **Dark Premium Theme**: Neon cyan and purple accents on dark background
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ with TypeScript
- **Styling**: Tailwind CSS v4 with custom dark theme
- **Web3**: Wagmi, Viem, RainbowKit (ready for integration)
- **UI Icons**: Lucide React
- **Type Safety**: Full TypeScript support
- **Utilities**: clsx, tailwind-merge

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Homepage
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Sticky navigation bar
│   │   └── Footer.tsx           # Footer component
│   ├── hero/
│   │   └── HeroSection.tsx      # Hero section with CTAs
│   ├── cards/
│   │   ├── ServiceCard.tsx      # Reusable service card
│   │   ├── ProviderCard.tsx     # Freelancer/AI agent card
│   │   └── CategoryCard.tsx     # Category card
│   └── sections/
│       ├── CategoriesSection.tsx
│       ├── FeaturedProvidersSection.tsx
│       ├── FeaturedServicesSection.tsx
│       ├── HowItWorksSection.tsx
│       └── TestimonialsSection.tsx
├── lib/
│   ├── constants.ts             # Mock data for development
│   └── utils.ts                 # Utility functions
├── types/
│   └── index.ts                 # TypeScript interfaces
└── public/                       # Static assets

```

## 🎨 Design System

### Color Palette
- **Background**: `#0a0e27` (Dark Navy)
- **Card**: `#1a1f3a` (Slightly lighter)
- **Border**: `#2d3561` (Subtle dividers)
- **Neon Cyan**: `#00D9FF` (Primary accent)
- **Neon Purple**: `#9D4EDD` (Secondary accent)
- **Neon Pink**: `#FF006E` (Highlights)
- **Neon Lime**: `#39FF14` (Accents)

### Typography
- **Hero Title**: `text-4xl md:text-6xl`
- **Section Heading**: `text-3xl md:text-4xl`
- **Subsection**: `text-2xl md:text-3xl`

### Components
- **btn-primary**: Gradient cyan-purple with hover effects
- **btn-secondary**: Cyan border with transparent background
- **card-premium**: Dark gradient with hover border glow
- **card-glass**: Frosted glass effect with blur

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or preferred package manager

### Installation

```bash
# Clone or navigate to the project
cd c:\dev\Hustl3

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🔧 Customization

### Adding New Services
Update `src/lib/constants.ts`:

```typescript
export const FEATURED_SERVICES: Service[] = [
  {
    id: 'service-1',
    title: 'Your Service Title',
    description: 'Service description',
    category: 'Category Name',
    price: 1.5,
    currency: 'ETH',
    provider: FEATURED_FREELANCERS[0],
    image: '🎨', // emoji or image path
    rating: 4.95,
    reviews: 156,
    deliveryTime: 5,
    featured: true,
  },
];
```

### Modifying Colors
Update `src/app/globals.css` and `tailwind.config.ts`:

```css
:root {
  --neon-cyan: #00D9FF;
  --neon-purple: #9D4EDD;
}
```

### Adding New Sections
1. Create a new component in `src/components/sections/`
2. Import it in `src/app/page.tsx`
3. Add it to the homepage layout

## 🌐 Web3 Integration (Ready)

The project is configured for Web3 integration with:
- `wagmi` for contract interactions
- `viem` for Ethereum operations
- `@rainbow-me/rainbowkit` for wallet connection

Example implementation:

```typescript
'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
  const { isConnected } = useAccount();
  
  return (
    <>
      <ConnectButton />
      {isConnected && <p>Wallet connected!</p>}
    </>
  );
}
```

## 📱 Responsive Design

All components are mobile-first and fully responsive:
- Mobile: 320px+
- Tablet: 640px+
- Desktop: 1024px+
- Large: 1280px+

## 🎯 Next Steps

### Phase 2: Smart Contracts
- Escrow contract for secure payments
- Dispute resolution mechanism
- Reputation system on-chain

### Phase 3: Backend API
- Service listing management
- User authentication
- Order processing
- Reviews and ratings

### Phase 4: AI Integration
- OpenAI/Claude API integration
- Service automation
- Recommendation engine

## 📄 License

MIT - Open source decentralized marketplace

## 🤝 Contributing

Contributions welcome! Please follow the established code patterns:
- Use TypeScript for type safety
- Keep components focused and reusable
- Follow the folder structure
- Add prop documentation

## 📞 Support

For issues and feature requests, refer to the project documentation or create an issue.

---

Built with ❤️ for the decentralized future of work.


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
