import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { ProgressBar } from '@/components/progress-bar';
import { ErrorBoundary } from '@/components/error-boundary';
import { Analytics } from '@/components/analytics';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ComplianceOS - Enterprise Compliance Management Platform',
    template: '%s | ComplianceOS',
  },
  description: 'Revolutionary compliance management platform for highly regulated industries. Streamline regulatory compliance, automate workflows, and ensure continuous compliance with AI-powered intelligence.',
  keywords: [
    'compliance management',
    'regulatory compliance',
    'enterprise software',
    'dental compliance',
    'restaurant compliance',
    'healthcare compliance',
    'compliance automation',
    'audit management',
    'risk management',
    'regulatory reporting',
  ],
  authors: [
    {
      name: 'ComplianceOS Team',
      url: 'https://complianceos.com',
    },
  ],
  creator: 'ComplianceOS',
  publisher: 'ComplianceOS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://complianceos.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://complianceos.com',
    title: 'ComplianceOS - Enterprise Compliance Management Platform',
    description: 'Revolutionary compliance management platform for highly regulated industries.',
    siteName: 'ComplianceOS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ComplianceOS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ComplianceOS - Enterprise Compliance Management Platform',
    description: 'Revolutionary compliance management platform for highly regulated industries.',
    images: ['/og-image.jpg'],
    creator: '@complianceos',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <ProgressBar />
              <div className="relative flex min-h-screen flex-col">
                {children}
              </div>
              <Toaster />
            </Providers>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}