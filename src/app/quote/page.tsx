import { QuickQuote } from '@/components/quote/quick-quote';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Your Free Quote',
  description: 'Get an instant price estimate for your cleaning service. No commitment required.',
  alternates: {
    canonical: '/quote',
  },
};

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Get Your Free Quote</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get an instant price estimate for your cleaning service. No commitment required.
          </p>
        </div>
        <QuickQuote />
      </div>
    </div>
  );
}