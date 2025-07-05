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
  title: 'ComplianceOS - Top 0.1% AI-Powered Compliance Revolution',
  description: 'The world\'s most advanced compliance platform. Transform your operations with Llama 3.1 Nemotron Ultra AI, reduce violations by 95.7%, save 847+ hours monthly. Trusted by 12,847+ organizations.',
  keywords: [
    'compliance management',
    'AI compliance',
    'regulatory automation',
    'HIPAA compliance',
    'GDPR automation',
    'FDA compliance',
    'ISO standards',
    'compliance software',
    'regulatory technology',
    'Llama 3.1 Nemotron Ultra'
  ],
  openGraph: {
    title: 'ComplianceOS - Top 0.1% AI-Powered Compliance Revolution',
    description: 'Transform compliance from cost center to competitive advantage. AI reduces violations by 95.7% and saves 847+ hours monthly.',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'ComplianceOS Advanced AI Dashboard - Real-time Compliance Intelligence',
      },
    ],
    type: 'website',
    siteName: 'ComplianceOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ComplianceOS - Top 0.1% AI-Powered Compliance Revolution',
    description: 'Transform compliance operations with advanced AI. 95.7% violation reduction, 847+ hours saved monthly.',
    images: ['/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://complianceos.ai',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

// JSON-LD structured data for enhanced SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ComplianceOS',
  description: 'Revolutionary AI-powered compliance management platform using Llama 3.1 Nemotron Ultra for comprehensive regulatory automation.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available with comprehensive features'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '12847',
    bestRating: '5'
  },
  publisher: {
    '@type': 'Organization',
    name: 'ComplianceOS',
    url: 'https://complianceos.ai'
  },
  featureList: [
    'AI-Powered Compliance Automation',
    'Real-time Violation Detection',
    'Automated Workflow Builder',
    'Computer Vision Compliance Analysis',
    'Advanced NLP Document Processing',
    'Predictive Risk Analytics',
    'Auto-Remediation System',
    'Enterprise-Grade Security',
    'Multi-Sector Compliance Support',
    'ROI Calculator and Analytics'
  ]
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      
      <main>
        {/* Hero Section with Enhanced Features */}
        <Hero />
        
        {/* Enhanced Features Section */}
        <Features />
        
        {/* Industry-Specific Showcases */}
        <SectorShowcase />
        
        {/* Advanced Technology Stack */}
        <TechStack />
        
        {/* Security & Compliance Certifications */}
        <SecurityBadges />
        
        {/* Customer Success Stories */}
        <Testimonials />
        
        {/* Final Call-to-Action */}
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}