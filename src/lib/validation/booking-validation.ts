/**
 * Booking Validation Utilities
 * 
 * Provides validation checkpoints for each step of the booking flow
 * and ensures total_price is properly handled based on booking status.
 */

import { Database } from '@/lib/database.types'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingStatus = Booking['status']

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingFields: string[]
}

export interface BookingStepValidation {
  step: number
  stepName: string
  requiredFields: string[]
  optionalFields: string[]
  validationRules: ValidationRule[]
}

export interface ValidationRule {
  field: string
  condition: (booking: Partial<Booking>) => boolean
  errorMessage: string
  warningMessage?: string
}

/**
 * Validation checkpoints for each booking step
 */
export const BOOKING_STEP_VALIDATIONS: BookingStepValidation[] = [
  {
    step: 1,
    stepName: 'Service Selection',
    requiredFields: ['service_id'],
    optionalFields: ['service_slug'],
    validationRules: [
      {
        field: 'service_id',
        condition: (booking) => !!booking.service_id,
        errorMessage: 'Service selection is required'
      }
    ]
  },
  {
    step: 2,
    stepName: 'Room Configuration',
    requiredFields: ['bedrooms', 'bathrooms'],
    optionalFields: [],
    validationRules: [
      {
        field: 'bedrooms',
        condition: (booking) => booking.bedrooms !== null && booking.bedrooms !== undefined && booking.bedrooms >= 1,
        errorMessage: 'Number of bedrooms must be at least 1'
      },
      {
        field: 'bathrooms',
        condition: (booking) => booking.bathrooms !== null && booking.bathrooms !== undefined && booking.bathrooms >= 1,
        errorMessage: 'Number of bathrooms must be at least 1'
      }
    ]
  },
  {
    step: 3,
    stepName: 'Extras Selection',
    requiredFields: [],
    optionalFields: ['extras'],
    validationRules: [
      {
        field: 'extras',
        condition: () => true, // Extras are always optional
        errorMessage: ''
      }
    ]
  },
  {
    step: 4,
    stepName: 'Location & Scheduling',
    requiredFields: ['area_id', 'booking_date', 'start_time', 'end_time', 'address', 'postcode'],
    optionalFields: ['special_instructions'],
    validationRules: [
      {
        field: 'area_id',
        condition: (booking) => !!booking.area_id,
        errorMessage: 'Location selection is required'
      },
      {
        field: 'booking_date',
        condition: (booking) => !!booking.booking_date,
        errorMessage: 'Booking date is required'
      },
      {
        field: 'start_time',
        condition: (booking) => !!booking.start_time,
        errorMessage: 'Start time is required'
      },
      {
        field: 'end_time',
        condition: (booking) => !!booking.end_time,
        errorMessage: 'End time is required'
      },
      {
        field: 'address',
        condition: (booking) => !!booking.address && booking.address.trim().length > 0,
        errorMessage: 'Address is required'
      },
      {
        field: 'postcode',
        condition: (booking) => !!booking.postcode && booking.postcode.trim().length > 0,
        errorMessage: 'Postcode is required'
      }
    ]
  },
  {
    step: 5,
    stepName: 'Cleaner Selection',
    requiredFields: [],
    optionalFields: ['cleaner_id', 'auto_assign'],
    validationRules: [
      {
        field: 'cleaner_id',
        condition: () => true, // Cleaner selection is optional
        errorMessage: ''
      }
    ]
  },
  {
    step: 6,
    stepName: 'Review & Payment',
    requiredFields: ['total_price'],
    optionalFields: [],
    validationRules: [
      {
        field: 'total_price',
        condition: (booking) => booking.total_price !== null && booking.total_price !== undefined && booking.total_price > 0,
        errorMessage: 'Total price must be calculated and greater than 0'
      }
    ]
  }
]

/**
 * Validates a booking against a specific step
 */
export function validateBookingStep(
  booking: Partial<Booking>,
  step: number
): ValidationResult {
  const stepValidation = BOOKING_STEP_VALIDATIONS.find(s => s.step === step)
  
  if (!stepValidation) {
    return {
      isValid: false,
      errors: [`Invalid step: ${step}`],
      warnings: [],
      missingFields: []
    }
  }

  const errors: string[] = []
  const warnings: string[] = []
  const missingFields: string[] = []

  // Check required fields
  for (const field of stepValidation.requiredFields) {
    const value = booking[field as keyof Booking]
    if (value === null || value === undefined || value === '') {
      missingFields.push(field)
    }
  }

  // Run validation rules
  for (const rule of stepValidation.validationRules) {
    if (!rule.condition(booking)) {
      if (rule.errorMessage) {
        errors.push(rule.errorMessage)
      }
      if (rule.warningMessage) {
        warnings.push(rule.warningMessage)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingFields
  }
}

/**
 * Validates booking for status transition
 */
export function validateStatusTransition(
  booking: Partial<Booking>,
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const missingFields: string[] = []

  // DRAFT → READY_FOR_PAYMENT transition
  if (fromStatus === 'DRAFT' && toStatus === 'READY_FOR_PAYMENT') {
    // All steps must be complete
    for (let step = 1; step <= 6; step++) {
      const stepValidation = validateBookingStep(booking, step)
      if (!stepValidation.isValid) {
        errors.push(...stepValidation.errors)
        missingFields.push(...stepValidation.missingFields)
      }
      warnings.push(...stepValidation.warnings)
    }

    // Additional validation for payment readiness
    if (!booking.total_price || booking.total_price <= 0) {
      errors.push('Total price must be calculated before proceeding to payment')
      missingFields.push('total_price')
    }
  }

  // READY_FOR_PAYMENT → CONFIRMED transition
  if (fromStatus === 'READY_FOR_PAYMENT' && toStatus === 'CONFIRMED') {
    if (!booking.paystack_ref) {
      errors.push('Payment reference is required for confirmed bookings')
      missingFields.push('paystack_ref')
    }
    
    if (!booking.paystack_status) {
      errors.push('Payment status is required for confirmed bookings')
      missingFields.push('paystack_status')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingFields
  }
}

/**
 * Gets the current step based on booking data
 */
export function getCurrentBookingStep(booking: Partial<Booking>): number {
  // Check each step in order
  for (let step = 1; step <= 6; step++) {
    const validation = validateBookingStep(booking, step)
    if (!validation.isValid) {
      return step
    }
  }
  
  // All steps complete
  return 6
}

/**
 * Determines if total_price should be calculated for the current booking state
 */
export function shouldCalculateTotalPrice(booking: Partial<Booking>): boolean {
  // Calculate total_price when we have the minimum required data
  return !!(
    booking.service_id &&
    booking.area_id &&
    booking.bedrooms !== null &&
    booking.bedrooms !== undefined &&
    booking.bathrooms !== null &&
    booking.bathrooms !== undefined
  )
}

/**
 * Gets the next required field for the current step
 */
export function getNextRequiredField(booking: Partial<Booking>): string | null {
  const currentStep = getCurrentBookingStep(booking)
  const stepValidation = BOOKING_STEP_VALIDATIONS.find(s => s.step === currentStep)
  
  if (!stepValidation) return null
  
  for (const field of stepValidation.requiredFields) {
    const value = booking[field as keyof Booking]
    if (value === null || value === undefined || value === '') {
      return field
    }
  }
  
  return null
}

/**
 * Creates a user-friendly error message for validation failures
 */
export function createValidationErrorMessage(result: ValidationResult): string {
  if (result.isValid) return ''
  
  if (result.missingFields.length > 0) {
    const fieldNames = result.missingFields.map(field => 
      field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )
    return `Please complete the following: ${fieldNames.join(', ')}`
  }
  
  if (result.errors.length > 0) {
    return result.errors.join('. ')
  }
  
  return 'Please check your booking details and try again'
}
