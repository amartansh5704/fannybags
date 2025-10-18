import api from './api';

export const investorService = {
  getHoldings: async (userId) => {
    const response = await api.get(`/users/${userId}/holdings`);
    return response.data;
  },

  getExpectedReturns: async (userId) => {
    const response = await api.get(`/users/${userId}/expected-returns`);
    return response.data;
  },

  getTransactions: async (userId) => {
    const response = await api.get(`/users/${userId}/transactions`);
    return response.data;
  },
};