import CleanerShowcase from '@/components/landing/cleaner-showcase'
import ExploreBlog from '@/components/landing/explore-blog'
import Hero from '@/components/landing/hero'
import HowItWorks from '@/components/landing/how-it-works'
import MyHomeHub from '@/components/landing/myhome-hub'
import PartnerLogos from '@/components/landing/partner-logos'
import Placements from '@/components/landing/placements'
import PlatformCards from '@/components/landing/platform-cards'
import SafetyTrust from '@/components/landing/safety-trust'
import WorkWithUs from '@/components/landing/work-with-us'

export default function Home() {
  return (
    <main id="main" className="flex flex-col">
      <Hero />
      <PlatformCards />
      <HowItWorks />
      <Placements />
      <MyHomeHub />
      <CleanerShowcase />
      <SafetyTrust />
      <WorkWithUs />
      <PartnerLogos />
      <ExploreBlog />
    </main>
  );
}