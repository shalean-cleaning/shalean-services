/**
 * Mock Paystack implementation for development and testing
 * This simulates Paystack API behavior without making real API calls
 */

export interface MockPaystackConfig {
  simulateSuccess: boolean;
  simulateDelay: number; // milliseconds
  mockReference: string;
}

export interface MockPaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface MockVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    metadata: Record<string, any>;
  };
}

/**
 * Mock Paystack payment initialization
 */
export async function mockInitializePayment(
  _email: string,
  _amount: number,
  reference: string,
  callbackUrl: string,
  _metadata: Record<string, any>,
  config: MockPaystackConfig = {
    simulateSuccess: true,
    simulateDelay: 1000,
    mockReference: reference
  }
): Promise<MockPaystackResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, config.simulateDelay));

  if (!config.simulateSuccess) {
    throw new Error('Mock Paystack API error: Payment initialization failed');
  }

  // Generate mock authorization URL
  const mockAuthUrl = `${callbackUrl}?reference=${config.mockReference}&status=success&mock=true`;

  return {
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: mockAuthUrl,
      access_code: `mock_access_${Date.now()}`,
      reference: config.mockReference
    }
  };
}

/**
 * Mock Paystack payment verification
 */
export async function mockVerifyPayment(
  reference: string,
  config: MockPaystackConfig = {
    simulateSuccess: true,
    simulateDelay: 1000,
    mockReference: reference
  }
): Promise<MockVerificationResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, config.simulateDelay));

  if (!config.simulateSuccess) {
    throw new Error('Mock Paystack API error: Payment verification failed');
  }

  // Parse amount from reference (assuming it's in the format PAY_<bookingId>_<timestamp>_<random>)
  const mockAmount = 50000; // 500.00 ZAR in cents

  return {
    status: true,
    message: 'Verification successful',
    data: {
      id: Math.floor(Math.random() * 1000000),
      domain: 'test',
      status: 'success',
      reference: config.mockReference,
      amount: mockAmount,
      currency: 'ZAR',
      gateway_response: 'Successful',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      channel: 'card',
      customer: {
        id: Math.floor(Math.random() * 10000),
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test@example.com',
        phone: '+27123456789'
      },
      metadata: {
        booking_id: 'mock-booking-id',
        customer_email: 'test@example.com'
      }
    }
  };
}

/**
 * Check if we should use mock Paystack (development mode)
 */
export function shouldUseMockPaystack(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.USE_MOCK_PAYSTACK === 'true' ||
         !process.env.PAYSTACK_SECRET_KEY;
}

/**
 * Get mock configuration from environment
 */
export function getMockConfig(): MockPaystackConfig {
  return {
    simulateSuccess: process.env.MOCK_PAYSTACK_SUCCESS !== 'false',
    simulateDelay: parseInt(process.env.MOCK_PAYSTACK_DELAY || '1000'),
    mockReference: `MOCK_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  };
}
