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
  
  // Pricing
  basePrice: number;
  totalPrice: number;
  
  // Current step
  currentStep: number;
  
  // Actions
  setSelectedService: (service: Service | null) => void;
  setBedroomCount: (count: number) => void;
  setBathroomCount: (count: number) => void;
  addExtra: (extra: Extra) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  calculateTotalPrice: () => void;
  setCurrentStep: (step: number) => void;
  resetBooking: () => void;
}

const initialState = {
  selectedService: null,
  bedroomCount: 1,
  bathroomCount: 1,
  selectedExtras: [],
  basePrice: 0,
  totalPrice: 0,
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
      
      calculateTotalPrice: () => {
        const { basePrice, bedroomCount, bathroomCount, selectedExtras } = get();
        
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
        
        const totalPrice = roomPrice + extrasTotal;
        
        set({ totalPrice });
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: Math.max(1, Math.min(3, step)) });
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
        currentStep: state.currentStep,
      }),
    }
  )
);
