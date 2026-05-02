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
import { IntegrationsSection } from '@repo/ui/home/IntegrationsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#06070A] text-text-main overflow-hidden selection:bg-accent selection:text-white relative">
      {/* Ambient Joyful Background for the whole page */}
      <div className="fixed top-0 left-0 w-full h-[1200px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8B5CF6]/10 via-[#06070A] to-[#06070A] -z-20 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#14F1D9]/10 via-transparent to-transparent -z-20 pointer-events-none" />
      <Navbar />

      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <MarketplacePreview />
        <LiveSwarmSection />
        <IntegrationsSection />
        <HowItWorksSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}