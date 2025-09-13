import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

import { Providers } from "@/app/providers";
import { CookieConsent } from "@/components/site/cookie-consent";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { SkipLink } from "@/components/site/skip-link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Shalean Cleaning Services',
    default: 'Shalean Cleaning Services - Professional Home Services',
  },
  description: 'Professional cleaning services, housekeeping, nanny care, and home management solutions. Book trusted cleaners and find full-time help for your home.',
  keywords: ['cleaning services', 'housekeeping', 'nanny', 'home care', 'domestic services'],
  authors: [{ name: 'Shalean Cleaning Services' }],
  creator: 'Shalean Cleaning Services',
  publisher: 'Shalean Cleaning Services',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: '/',
    siteName: 'Shalean Cleaning Services',
    title: 'Shalean Cleaning Services - Professional Home Services',
    description: 'Professional cleaning services, housekeeping, nanny care, and home management solutions.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shalean Cleaning Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shalean Cleaning Services - Professional Home Services',
    description: 'Professional cleaning services, housekeeping, nanny care, and home management solutions.',
    images: ['/og-image.jpg'],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Shalean Cleaning Services',
              url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
              description: 'Professional cleaning services, housekeeping, nanny care, and home management solutions.',
              sameAs: [
                'https://facebook.com/shalean',
                'https://twitter.com/shalean',
                'https://instagram.com/shalean',
                'https://linkedin.com/company/shalean',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+27-12-345-6789',
                contactType: 'customer service',
                areaServed: 'ZA',
                availableLanguage: 'English',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to content link for accessibility */}
        <SkipLink />
        
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        
        <CookieConsent />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
