import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import QuoteDetailClient from './QuoteDetailClient';

interface QuoteDetailPageProps {
  params: Promise<{ shortId: string }>;
}

async function getQuoteByShortId(shortId: string) {
  const supabase = await createSupabaseServer();
  
  // Fetch the quote - quotes are public (no auth required per PRD)
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select(`
      *,
      services (
        id,
        name,
        description,
        base_fee,
        slug
      ),
      suburbs (
        id,
        name,
        slug
      )
    `)
    .eq('short_id', shortId)
    .single();

  if (fetchError || !quote) {
    return null;
  }

  return quote;
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { shortId } = await params;
  
  const quote = await getQuoteByShortId(shortId);
  
  if (!quote) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading quote details...</p>
          </div>
        }>
          <QuoteDetailClient quote={quote} />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: QuoteDetailPageProps) {
  const { shortId: _shortId } = await params;
  
  return {
    title: `Quote Details - Shalean Cleaning Services`,
    description: 'View your personalized cleaning service quote',
    robots: 'noindex, nofollow' // PRD requirement: transactional routes are noindex
  };
}
