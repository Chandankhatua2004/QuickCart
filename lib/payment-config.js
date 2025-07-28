// Payment Gateway Configuration
// Replace these with your actual API keys from respective payment gateways

export const paymentConfig = {
  // Razorpay Configuration (Popular in India)
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_RAZORPAY_KEY',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_SECRET',
    currency: 'INR',
    name: 'QuickCart',
    description: 'Order Payment',
    image: '/logo.png'
  },

  // Stripe Configuration (International)
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_KEY',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET',
    currency: 'usd'
  },

  // PayPal Configuration
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_SECRET',
    currency: 'USD',
    environment: 'sandbox' // Change to 'live' for production
  }
};

// Payment method icons and styling
export const paymentMethodIcons = {
  razorpay: '💳',
  stripe: '💳',
  paypal: '📱',
  cod: '💵'
};

// Payment method descriptions
export const paymentMethodDescriptions = {
  razorpay: 'Pay with cards, UPI, net banking, wallets',
  stripe: 'International payment gateway with cards',
  paypal: 'Pay with PayPal account worldwide',
  cod: 'Pay when you receive your order'
};

// Payment validation rules
export const paymentValidationRules = {
  razorpay: {
    required: ['email', 'phoneNumber'],
    email: true,
    phone: true
  },
  stripe: {
    required: ['email', 'phoneNumber'],
    email: true,
    phone: true
  },
  paypal: {
    required: ['email'],
    email: true
  },
  cod: {
    required: [],
    email: false,
    phone: false
  }
}; 