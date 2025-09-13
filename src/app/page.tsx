import DynamicHero from '@/components/landing/dynamic-hero'
import DynamicHowItWorks from '@/components/landing/dynamic-how-it-works'
import DynamicWhyChooseUs from '@/components/landing/dynamic-why-choose-us'
import DynamicTeamGrid from '@/components/landing/dynamic-team-grid'
import DynamicTestimonials from '@/components/landing/dynamic-testimonials'
import DynamicBlogPreview from '@/components/landing/dynamic-blog-preview'
import PlatformCards from '@/components/landing/platform-cards'
import SafetyTrust from '@/components/landing/safety-trust'
import WorkWithUs from '@/components/landing/work-with-us'
import PartnerLogos from '@/components/landing/partner-logos'

export default function Home() {
  return (
    <main id="main" className="flex flex-col">
      <DynamicHero />
      <PlatformCards />
      <DynamicHowItWorks />
      <DynamicWhyChooseUs />
      <DynamicTeamGrid />
      <DynamicTestimonials />
      <DynamicBlogPreview />
      <SafetyTrust />
      <WorkWithUs />
      <PartnerLogos />
    </main>
  );
}