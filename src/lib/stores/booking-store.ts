import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Service, Extra } from '@/lib/database.types';

export interface BookingState {
  // Service selection
  selectedService: Service | null;
  
  // Room counts
  bedroomCount: number;
  bathroomCount: number;
  
  // Selected extras
  selectedExtras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  
  // Location and scheduling
  selectedRegion: string | null;
  selectedSuburb: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  address: string;
  address2?: string;
  postcode: string;
  specialInstructions?: string;
  
  // Cleaner selection
  selectedCleanerId: string | null;
  availableCleaners: Array<{
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    experienceYears: number;
    bio?: string;
    avatarUrl?: string;
    eta?: string;
    badges?: string[];
  }>;
  
  // Pricing
  basePrice: number;
  totalPrice: number;
  deliveryFee: number;
  
  // Current step
  currentStep: number;
  
  // Actions
  setSelectedService: (service: Service | null) => void;
  setBedroomCount: (count: number) => void;
  setBathroomCount: (count: number) => void;
  addExtra: (extra: Extra) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  setSelectedRegion: (regionId: string | null) => void;
  setSelectedSuburb: (suburbId: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setAddress: (address: string) => void;
  setAddress2: (address2: string) => void;
  setPostcode: (postcode: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  setSelectedCleanerId: (cleanerId: string | null) => void;
  setAvailableCleaners: (cleaners: Array<{
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    experienceYears: number;
    bio?: string;
    avatarUrl?: string;
    eta?: string;
    badges?: string[];
  }>) => void;
  autoAssignCleaner: () => void;
  calculateTotalPrice: () => void;
  setCurrentStep: (step: number) => void;
  resetBooking: () => void;
}

const initialState = {
  selectedService: null,
  bedroomCount: 1,
  bathroomCount: 1,
  selectedExtras: [],
  selectedRegion: null,
  selectedSuburb: null,
  selectedDate: null,
  selectedTime: null,
  address: '',
  address2: '',
  postcode: '',
  specialInstructions: '',
  selectedCleanerId: null,
  availableCleaners: [],
  basePrice: 0,
  totalPrice: 0,
  deliveryFee: 0,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSelectedService: (service) => {
        set({ 
          selectedService: service,
          basePrice: service?.base_price || 0 
        });
        get().calculateTotalPrice();
      },
      
      setBedroomCount: (count) => {
        set({ bedroomCount: Math.max(1, count) });
        get().calculateTotalPrice();
      },
      
      setBathroomCount: (count) => {
        set({ bathroomCount: Math.max(1, count) });
        get().calculateTotalPrice();
      },
      
      addExtra: (extra) => {
        const { selectedExtras } = get();
        const existingExtra = selectedExtras.find(e => e.id === extra.id);
        
        if (existingExtra) {
          set({
            selectedExtras: selectedExtras.map(e =>
              e.id === extra.id
                ? { ...e, quantity: e.quantity + 1 }
                : e
            )
          });
        } else {
          set({
            selectedExtras: [
              ...selectedExtras,
              {
                id: extra.id,
                name: extra.name,
                price: extra.price,
                quantity: 1,
              }
            ]
          });
        }
        get().calculateTotalPrice();
      },
      
      removeExtra: (extraId) => {
        set({
          selectedExtras: get().selectedExtras.filter(e => e.id !== extraId)
        });
        get().calculateTotalPrice();
      },
      
      updateExtraQuantity: (extraId, quantity) => {
        if (quantity <= 0) {
          get().removeExtra(extraId);
          return;
        }
        
        set({
          selectedExtras: get().selectedExtras.map(e =>
            e.id === extraId ? { ...e, quantity } : e
          )
        });
        get().calculateTotalPrice();
      },
      
      setSelectedRegion: (regionId) => {
        set({ selectedRegion: regionId });
        // Reset suburb when region changes
        if (regionId !== get().selectedRegion) {
          set({ selectedSuburb: null });
        }
      },
      
      setSelectedSuburb: (suburbId) => {
        set({ selectedSuburb: suburbId });
        // Fetch delivery fee for the selected suburb
        if (suburbId) {
          fetch(`/api/suburbs`)
            .then(res => res.json())
            .then(suburbs => {
              const suburb = suburbs.find((s: { id: string; delivery_fee: number }) => s.id === suburbId);
              if (suburb) {
                set({ deliveryFee: suburb.delivery_fee || 0 });
              }
            })
            .catch(err => {
              console.error('Error fetching suburb delivery fee:', err);
              set({ deliveryFee: 0 });
            });
        } else {
          set({ deliveryFee: 0 });
        }
        get().calculateTotalPrice();
      },
      
      setSelectedDate: (date) => {
        set({ selectedDate: date });
        // Reset time when date changes
        if (date !== get().selectedDate) {
          set({ selectedTime: null });
        }
      },
      
      setSelectedTime: (time) => {
        set({ selectedTime: time });
      },
      
      setAddress: (address) => {
        set({ address });
      },
      
      setAddress2: (address2) => {
        set({ address2 });
      },
      
      setPostcode: (postcode) => {
        set({ postcode });
      },
      
      setSpecialInstructions: (instructions) => {
        set({ specialInstructions: instructions });
      },
      
      setSelectedCleanerId: (cleanerId) => {
        set({ selectedCleanerId: cleanerId });
      },
      
      setAvailableCleaners: (cleaners) => {
        set({ availableCleaners: cleaners });
      },
      
      autoAssignCleaner: () => {
        const { availableCleaners } = get();
        if (availableCleaners.length > 0) {
          // Deterministic auto-assign: pick the cleaner with highest rating
          // If ratings are equal, pick the one with most experience
          const bestCleaner = availableCleaners.reduce((best, current) => {
            if (current.rating > best.rating) return current;
            if (current.rating === best.rating && current.experienceYears > best.experienceYears) return current;
            return best;
          });
          set({ selectedCleanerId: bestCleaner.id });
        }
      },
      
      calculateTotalPrice: () => {
        const { basePrice, bedroomCount, bathroomCount, selectedExtras, deliveryFee } = get();
        
        // Base price calculation (simplified - in real app, you'd use pricing rules)
        let roomPrice = basePrice;
        
        // Add pricing for additional bedrooms/bathrooms
        if (bedroomCount > 1) {
          roomPrice += (bedroomCount - 1) * 20; // $20 per additional bedroom
        }
        if (bathroomCount > 1) {
          roomPrice += (bathroomCount - 1) * 15; // $15 per additional bathroom
        }
        
        // Add extras
        const extrasTotal = selectedExtras.reduce(
          (total, extra) => total + (extra.price * extra.quantity),
          0
        );
        
        const totalPrice = roomPrice + extrasTotal + deliveryFee;
        
        set({ totalPrice });
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: Math.max(1, Math.min(5, step)) });
      },
      
      resetBooking: () => {
        set(initialState);
      },
    }),
    {
      name: 'booking-store',
      partialize: (state) => ({
        selectedService: state.selectedService,
        bedroomCount: state.bedroomCount,
        bathroomCount: state.bathroomCount,
        selectedExtras: state.selectedExtras,
        selectedRegion: state.selectedRegion,
        selectedSuburb: state.selectedSuburb,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        address: state.address,
        address2: state.address2,
        postcode: state.postcode,
        specialInstructions: state.specialInstructions,
        selectedCleanerId: state.selectedCleanerId,
        availableCleaners: state.availableCleaners,
        currentStep: state.currentStep,
      }),
    }
  )
);
