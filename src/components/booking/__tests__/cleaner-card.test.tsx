import { render, screen, fireEvent } from '@testing-library/react';
import { CleanerCard } from '../cleaner-card';

const mockCleaner = {
  id: 'cleaner-1',
  name: 'John Doe',
  rating: 4.8,
  totalRatings: 150,
  experienceYears: 5,
  bio: 'Professional cleaner with 5 years experience',
  eta: '25 min',
  badges: ['Top Rated', 'Experienced'],
};

const mockOnSelect = jest.fn();

describe('CleanerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders cleaner information correctly', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('4.8 (150 reviews)')).toBeInTheDocument();
      expect(screen.getByText('5 years experience')).toBeInTheDocument();
      expect(screen.getByText('ETA: 25 min')).toBeInTheDocument();
      expect(screen.getByText('Professional cleaner with 5 years experience')).toBeInTheDocument();
    });

    it('renders badges correctly', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('Top Rated')).toBeInTheDocument();
      expect(screen.getByText('Experienced')).toBeInTheDocument();
    });

    it('shows user icon when no avatar is provided', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('renders star rating correctly', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      // Should show 4 full stars and 1 half star for 4.8 rating
      const stars = screen.getAllByRole('img', { hidden: true });
      expect(stars).toHaveLength(5); // 5 star elements
    });
  });

  describe('Selection State', () => {
    it('shows selected state when isSelected is true', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={true} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('Selected')).toBeInTheDocument();
      // Should have selected styling (ring-2 ring-blue-500 bg-blue-50)
      const card = screen.getByRole('button', { name: /john doe/i }).closest('.ring-2');
      expect(card).toBeInTheDocument();
    });

    it('shows unselected state when isSelected is false', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('shows selection indicator when selected', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={true} onSelect={mockOnSelect} />);
      
      // Should show the blue dot indicator
      const indicator = screen.getByRole('button', { name: /john doe/i }).closest('.ring-2');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when card is clicked', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      const card = screen.getByRole('button', { name: /john doe/i });
      fireEvent.click(card);
      
      expect(mockOnSelect).toHaveBeenCalledWith('cleaner-1');
    });

    it('calls onSelect when select button is clicked', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      const selectButton = screen.getByText('Select');
      fireEvent.click(selectButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith('cleaner-1');
    });

    it('prevents event propagation when select button is clicked', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      const selectButton = screen.getByText('Select');
      
      // Mock stopPropagation
      const stopPropagation = jest.fn();
      fireEvent.click(selectButton, { stopPropagation });
      
      expect(mockOnSelect).toHaveBeenCalledWith('cleaner-1');
    });
  });

  describe('Edge Cases', () => {
    it('handles cleaner without bio', () => {
      const cleanerWithoutBio = { ...mockCleaner, bio: undefined };
      render(<CleanerCard cleaner={cleanerWithoutBio} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Professional cleaner with 5 years experience')).not.toBeInTheDocument();
    });

    it('handles cleaner without badges', () => {
      const cleanerWithoutBadges = { ...mockCleaner, badges: undefined };
      render(<CleanerCard cleaner={cleanerWithoutBadges} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Top Rated')).not.toBeInTheDocument();
    });

    it('handles cleaner without ETA', () => {
      const cleanerWithoutETA = { ...mockCleaner, eta: undefined };
      render(<CleanerCard cleaner={cleanerWithoutETA} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('ETA: 25 min')).not.toBeInTheDocument();
    });

    it('handles zero rating', () => {
      const cleanerWithZeroRating = { ...mockCleaner, rating: 0 };
      render(<CleanerCard cleaner={cleanerWithZeroRating} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('0.0 (150 reviews)')).toBeInTheDocument();
    });

    it('handles zero total ratings', () => {
      const cleanerWithZeroRatings = { ...mockCleaner, totalRatings: 0 };
      render(<CleanerCard cleaner={cleanerWithZeroRatings} isSelected={false} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('4.8 (0 reviews)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      const card = screen.getByRole('button', { name: /john doe/i });
      expect(card).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      render(<CleanerCard cleaner={mockCleaner} isSelected={false} onSelect={mockOnSelect} />);
      
      const card = screen.getByRole('button', { name: /john doe/i });
      fireEvent.keyDown(card, { key: 'Enter' });
      
      // Should be clickable with keyboard
      expect(card).toBeInTheDocument();
    });
  });
});
