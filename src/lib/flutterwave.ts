/**
 * Flutterwave Payment Service
 * Handles payment initialization, verification, and tracking
 */

export interface FlutterWavePaymentData {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
}

/**
 * Initialize Flutterwave payment
 * Returns payment configuration object
 */
export const initializeFlutterWavePayment = (
  amount: number,
  email: string,
  phone: string,
  name: string,
  orderReference: string
): FlutterWavePaymentData => {
  return {
    tx_ref: orderReference,
    amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email,
      phone_number: phone,
      name
    },
    customizations: {
      title: 'THEWONDERPLACE',
      description: 'Food Order Payment',
      logo: '/logo.png'
    }
  };
};

/**
 * Generate unique transaction reference
 * Format: WP_[timestamp]_[random]
 */
export const generateTransactionReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `WP_${timestamp}_${random}`;
};

/**
 * Verify payment with Flutterwave API
 * Uses transaction reference to check payment status
 */
export const verifyFlutterWavePayment = async (
  transactionReference: string,
  secretKey: string
): Promise<{
  status: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      phone_number: string;
      name: string;
    };
  };
  error?: string;
}> => {
  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${transactionReference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      status: 'error',
      error: 'Failed to verify payment'
    };
  }
};

/**
 * Format amount for Flutterwave (in kobo if needed)
 * Flutterwave accepts amounts in the minor currency unit
 */
export const formatAmountForFlutterwave = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

/**
 * Check if payment is successful
 */
export const isPaymentSuccessful = (status: string): boolean => {
  return status === 'successful' || status === 'completed';
};
