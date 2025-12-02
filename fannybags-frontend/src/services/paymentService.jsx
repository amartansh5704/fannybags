import api from './api';

/* ============================================================
   RAZORPAY INTEGRATION (NEW — ONLY ADDED, NOTHING REMOVED)
   ============================================================ */

// Get Razorpay configuration
export const getRazorpayConfig = async () => {
  const response = await api.get('/payments/razorpay/config');
  return response.data;
};

// Create a Razorpay order
export const createRazorpayOrder = async (amount, paymentType = 'wallet_deposit') => {
  const response = await api.post('/payments/razorpay/create-order', {
    amount,
    payment_type: paymentType
  });
  return response.data;
};

// Verify payment
export const verifyRazorpayPayment = async (paymentData) => {
  const response = await api.post('/payments/razorpay/verify', {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature
  });
  return response.data;
};

// Check payment status
export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/payments/razorpay/payment-status/${orderId}`);
  return response.data;
};

// Get user payment history
export const getPaymentHistory = async (page = 1, perPage = 20) => {
  const response = await api.get('/payments/razorpay/orders', {
    params: { page, per_page: perPage }
  });
  return response.data;
};

// Check if Razorpay script loaded
export const isRazorpayLoaded = () => {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
};

// Load Razorpay Checkout.js script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (isRazorpayLoaded()) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

// Main Razorpay Payment Initiation
export const initiateRazorpayPayment = (amount, options = {}) => {
  return new Promise((resolve, reject) => {
    // Wrap async logic inside an async IIFE (safe)
    (async () => {
      try {
        // Step 1: Create order on backend
        const orderResponse = await createRazorpayOrder(amount, options.paymentType);

        if (!orderResponse.success) {
          return reject({
            success: false,
            message: orderResponse.error || 'Failed to create order'
          });
        }

        const orderData = orderResponse.data;

        // Step 2: Prepare Razorpay options
        const razorpayOptions = {
          key: orderData.key_id,
          amount: orderData.amount_in_paise,
          currency: orderData.currency,
          name: orderData.company_name || 'FannyBags',
          description: options.description || `Add ₹${amount} to Wallet`,
          order_id: orderData.order_id,

          prefill: {
            name: orderData.user_name || '',
            email: orderData.user_email || '',
            contact: orderData.user_phone || ''
          },

          theme: {
            color: options.themeColor || '#FF48B9'
          },

          notes: {
            purpose: options.paymentType || 'wallet_deposit'
          },

          modal: {
            ondismiss: () => {
              reject({
                dismissed: true,
                message: 'Payment cancelled by user'
              });
            }
          },

          handler: async function (response) {
            try {
              const verifyResponse = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResponse.success) {
                resolve({
                  success: true,
                  ...verifyResponse.data,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id
                });
              } else {
                reject({
                  success: false,
                  message: verifyResponse.error || 'Payment verification failed'
                });
              }
            } catch (err) {
              reject({
                success: false,
                message:
                  err?.response?.data?.error ||
                  err.message ||
                  'Payment verification failed'
              });
            }
          }
        };

        // Step 3: Open Razorpay popup
        const rzp = new window.Razorpay(razorpayOptions);

        rzp.on('payment.failed', (response) => {
          reject({
            success: false,
            error: response.error,
            message: response.error?.description || 'Payment failed'
          });
        });

        rzp.open();
      } catch (error) {
        reject({
          success: false,
          message:
            error?.response?.data?.error ||
            error.message ||
            'Failed to initiate payment'
        });
      }
    })(); // Immediately invoked async function

  }); // end Promise
};


/* ============================================================
   EXISTING MOCK PAYMENT FUNCTIONS (UNCHANGED)
   ============================================================ */

// Get available payment methods
export const getPaymentMethods = async () => {
  const response = await api.get('/payments/methods');
  return response.data;
};

// Get mock config
export const getPaymentConfig = async () => {
  const response = await api.get('/payments/config');
  return response.data;
};

// Initiate deposit
export const initiateDeposit = async (amount) => {
  const response = await api.post('/payments/deposit/initiate', { amount });
  return response.data;
};

// Process deposit
export const processDeposit = async (transactionId) => {
  const response = await api.post('/payments/deposit/process', {
    transaction_id: transactionId
  });
  return response.data;
};

// Verify deposit
export const verifyDeposit = async (transactionId) => {
  const response = await api.post('/payments/deposit/verify', {
    transaction_id: transactionId
  });
  return response.data;
};
