// investorService.js
import api from './api';

export const investorService = {
  getHoldings: async (userId) => {
    const response = await api.get(`/users/${userId}/holdings`);
    return response.data;
  },
  
  getExpectedReturns: async (userId) => {
  const response = await api.get(`/users/${userId}/expected-returns`);
  console.log('Expected returns response:', response.data);
  return response.data;
},

  getTransactions: async (userId) => {
    // Add validation
    if (!userId) {
      throw new Error('User ID is required');
    }
    // Add debug log
    console.log('Fetching transactions for user:', userId, 'Type:', typeof userId);
    try {
      const response = await api.get(`/users/${userId}/transactions`);
      console.log('Transactions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  getEarnings: async (userId) => {
    const response = await api.get(`/investor/earnings/${userId}`);
    return response.data;
  }
};