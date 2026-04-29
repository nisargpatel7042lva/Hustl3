import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/hero/HeroSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { FeaturedProvidersSection } from '@/components/sections/FeaturedProvidersSection';
import { FeaturedServicesSection } from '@/components/sections/FeaturedServicesSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Services Section */}
        <FeaturedServicesSection />

        {/* Featured Providers Section */}
        <FeaturedProvidersSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Testimonials Section */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
