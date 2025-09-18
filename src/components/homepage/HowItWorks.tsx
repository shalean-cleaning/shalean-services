import { getHowItWorksContent } from '@/lib/homepage-data';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard } from '@/components/anim/motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import LinkSafe from '@/components/LinkSafe';

export default async function HowItWorks() {
  const steps = await getHowItWorksContent();
  
  // If no data from database, use fallback
  const displaySteps = steps.length > 0 ? steps : [
    {
      id: '1',
      title: 'Choose your service',
      description: 'Select rooms & add-ons as you need.',
      order_index: 1
    },
    {
      id: '2', 
      title: 'Pick date & time',
      description: 'We\'ll match you with an available pro.',
      order_index: 2
    },
    {
      id: '3',
      title: 'Relax & track',
      description: 'Get updates and manage bookings online.',
      order_index: 3
    }
  ];

  return (
    <MotionSection className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <MotionItem variants={fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              A spotless home in three steps
            </h2>
          </MotionItem>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 transform -translate-y-1/2"></div>
          
          <StaggerList className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {displaySteps.map((step, index) => (
              <MotionItem key={step.id} variants={fadeUp}>
                <div className="text-center relative">
                  <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 relative z-10">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </MotionItem>
            ))}
          </StaggerList>
        </div>

        <div className="text-center mt-12">
          <MotionItem variants={popCard}>
            <Button variant="outline" size="lg" asChild>
              <LinkSafe href="#how-it-works">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </LinkSafe>
            </Button>
          </MotionItem>
        </div>
      </div>
    </MotionSection>
  );
}
