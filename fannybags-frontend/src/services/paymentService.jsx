import api from './api';

/**
 * Get available payment methods
 */
export const getPaymentMethods = async () => {
  const response = await api.get('/payments/methods');
  return response.data;
};

/**
 * Get payment configuration
 */
export const getPaymentConfig = async () => {
  const response = await api.get('/payments/config');
  return response.data;
};

/**
 * Initiate a deposit transaction
 * @param {number} amount - Deposit amount
 */
export const initiateDeposit = async (amount) => {
  const response = await api.post('/payments/deposit/initiate', { amount });
  return response.data;
};

/**
 * Process the deposit payment
 * @param {string} transactionId - Transaction ID from initiation
 */
export const processDeposit = async (transactionId) => {
  const response = await api.post('/payments/deposit/process', {
    transaction_id: transactionId
  });
  return response.data;
};

/**
 * Verify deposit status
 * @param {string} transactionId - Transaction ID to verify
 */
export const verifyDeposit = async (transactionId) => {
  const response = await api.post('/payments/deposit/verify', {
    transaction_id: transactionId
  });
  return response.data;
};