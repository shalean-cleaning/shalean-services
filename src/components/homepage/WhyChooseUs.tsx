import { getWhyChooseUsContent } from '@/lib/homepage-data';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard } from '@/components/anim/motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, UserCheck } from 'lucide-react';

export default async function WhyChooseUs() {
  const features = await getWhyChooseUsContent();
  
  // If no data from database, use fallback
  const displayFeatures = features.length > 0 ? features : [
    {
      id: '1',
      title: 'Easy scheduling',
      description: 'Pick a time that works. We\'ll handle the rest.',
      order_index: 1
    },
    {
      id: '2',
      title: 'Transparent pricing', 
      description: 'Clear rates. No surprises.',
      order_index: 2
    },
    {
      id: '3',
      title: 'Vetted professionals',
      description: 'Background-checked, well-reviewed cleaners.',
      order_index: 3
    }
  ];

  // Icon mapping for features
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('scheduling') || title.toLowerCase().includes('schedule')) {
      return Calendar;
    } else if (title.toLowerCase().includes('pricing') || title.toLowerCase().includes('price')) {
      return FileText;
    } else if (title.toLowerCase().includes('professional') || title.toLowerCase().includes('vetted')) {
      return UserCheck;
    }
    return Calendar; // default
  };

  return (
    <MotionSection className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayFeatures.map((feature) => {
            const IconComponent = getIcon(feature.title);
            return (
              <MotionItem key={feature.id} variants={popCard}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </MotionItem>
            );
          })}
        </StaggerList>
      </div>
    </MotionSection>
  );
}
