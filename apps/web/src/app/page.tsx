'use client';

import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { HeroSection } from '@repo/ui/home/HeroSection';
import { TrustBar } from '@repo/ui/home/TrustBar';
import { FeaturesSection } from '@repo/ui/home/FeaturesSection';
import { MarketplacePreview } from '@repo/ui/home/MarketplacePreview';
import { LiveSwarmSection } from '@repo/ui/home/LiveSwarmSection';
import { HowItWorksSection } from '@repo/ui/home/HowItWorksSection';
import { CTASection } from '@repo/ui/home/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-main overflow-hidden selection:bg-accent selection:text-white">
      <Navbar />

      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <MarketplacePreview />
        <LiveSwarmSection />
        <HowItWorksSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}