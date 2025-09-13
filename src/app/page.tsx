import DynamicBlogPreview from '@/components/landing/dynamic-blog-preview'
import DynamicHero from '@/components/landing/dynamic-hero'
import DynamicHowItWorks from '@/components/landing/dynamic-how-it-works'
import DynamicTeamGrid from '@/components/landing/dynamic-team-grid'
import DynamicTestimonials from '@/components/landing/dynamic-testimonials'
import DynamicWhyChooseUs from '@/components/landing/dynamic-why-choose-us'
import PartnerLogos from '@/components/landing/partner-logos'
import PlatformCards from '@/components/landing/platform-cards'
import SafetyTrust from '@/components/landing/safety-trust'
import WorkWithUs from '@/components/landing/work-with-us'

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