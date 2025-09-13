'use client';

import { useState } from 'react';
import { Star, Clock, Award, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CleanerCardProps {
  cleaner: {
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    experienceYears: number;
    bio?: string;
    avatarUrl?: string;
    eta?: string;
    badges?: string[];
  };
  isSelected: boolean;
  onSelect: (cleanerId: string) => void;
}

export function CleanerCard({ cleaner, isSelected, onSelect }: CleanerCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={() => onSelect(cleaner.id)}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {cleaner.avatarUrl && !imageError ? (
            <img
              src={cleaner.avatarUrl}
              alt={cleaner.name}
              className="w-16 h-16 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" data-testid="user-icon" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {cleaner.name}
            </h3>
            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              {renderStars(cleaner.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {cleaner.rating.toFixed(1)} ({cleaner.totalRatings} reviews)
            </span>
          </div>

          {/* Experience */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Award className="w-4 h-4" />
              <span>{cleaner.experienceYears} years experience</span>
            </div>
            {cleaner.eta && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>ETA: {cleaner.eta}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {cleaner.bio && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {cleaner.bio}
            </p>
          )}

          {/* Badges */}
          {cleaner.badges && cleaner.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {cleaner.badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Select Button */}
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(cleaner.id);
            }}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
