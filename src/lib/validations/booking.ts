import { z } from 'zod';

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  bedroomCount: z.number().min(1, 'At least 1 bedroom is required').max(10, 'Maximum 10 bedrooms allowed'),
  bathroomCount: z.number().min(1, 'At least 1 bathroom is required').max(10, 'Maximum 10 bathrooms allowed'),
  selectedExtras: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1),
  })).optional().default([]),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const validateBookingData = (data: unknown) => {
  try {
    return { success: true, data: bookingSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      };
    }
    return { 
      success: false, 
      errors: [{ field: 'unknown', message: 'Unknown validation error' }]
    };
  }
};
