import { getTeamMembers } from '@/lib/homepage-data';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard } from '@/components/anim/motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';

export default async function TeamGrid() {
  const teamMembers = await getTeamMembers();
  
  // If no data from database, use fallback
  const displayMembers = teamMembers.length > 0 ? teamMembers : [
    {
      id: '1',
      name: 'Ayanda M.',
      role: 'Professional Cleaner',
      bio: 'Friendly, punctual, and thorough.',
      photo_url: IMAGES.profile,
      cleans: '200+ cleans',
      location: 'CBD, Sea Point'
    },
    {
      id: '2',
      name: 'Sarah K.',
      role: 'Professional Cleaner', 
      bio: 'Detail-oriented and reliable.',
      photo_url: IMAGES.profile,
      cleans: '150+ cleans',
      location: 'Claremont, Rondebosch'
    },
    {
      id: '3',
      name: 'Thabo N.',
      role: 'Professional Cleaner',
      bio: 'Professional and efficient.',
      photo_url: IMAGES.profile,
      cleans: '180+ cleans',
      location: 'Table View, Milnerton'
    },
    {
      id: '4',
      name: 'Lisa P.',
      role: 'Professional Cleaner',
      bio: 'Experienced and trustworthy.',
      photo_url: IMAGES.profile,
      cleans: '220+ cleans',
      location: 'Constantia, Tokai'
    }
  ];

  return (
    <MotionSection className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <MotionItem variants={fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet some of our pros
            </h2>
          </MotionItem>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["All", "Top Rated", "Nearby", "Available this week"].map((filter) => (
            <MotionItem key={filter} variants={popCard}>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                {filter}
              </button>
            </MotionItem>
          ))}
        </div>

        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayMembers.map((member) => (
            <MotionItem key={member.id} variants={popCard}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                    <SafeImage
                      src={member.photo_url || IMAGES.profile}
                      alt={`${member.name}, professional cleaner`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc={IMAGES.profile}
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-1 mb-2" aria-label="5 star rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{member.cleans || 'Professional Cleaner'}</p>
                  <p className="text-xs text-gray-500">{member.location || member.role}</p>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {member.bio}
                  </CardDescription>
                </CardContent>
              </Card>
            </MotionItem>
          ))}
        </StaggerList>
      </div>
    </MotionSection>
  );
}
