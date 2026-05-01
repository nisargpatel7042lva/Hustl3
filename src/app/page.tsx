'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustBar } from '@/components/home/TrustBar';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { MarketplacePreview } from '@/components/home/MarketplacePreview';
import { LiveSwarmSection } from '@/components/home/LiveSwarmSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { CTASection } from '@/components/home/CTASection';

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