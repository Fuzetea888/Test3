import { Metadata } from 'next';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { SectorShowcase } from '@/components/landing/sector-showcase';
import { TechStack } from '@/components/landing/tech-stack';
import { SecurityBadges } from '@/components/landing/security-badges';
import { Testimonials } from '@/components/landing/testimonials';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';

export const metadata: Metadata = {
  title: 'ComplianceOS - Revolutionary Compliance Management Platform',
  description: 'Transform your compliance operations with AI-powered automation, real-time monitoring, and intelligent workflows. Trusted by 10,000+ organizations across highly regulated industries.',
  openGraph: {
    title: 'ComplianceOS - Revolutionary Compliance Management Platform',
    description: 'Transform your compliance operations with AI-powered automation, real-time monitoring, and intelligent workflows.',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'ComplianceOS Platform Dashboard',
      },
    ],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero />
        
        <Features />
        
        <SectorShowcase />
        
        <TechStack />
        
        <SecurityBadges />
        
        <Testimonials />
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}