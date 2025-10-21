import api from './api';

const walletService = {
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  deposit: async (amount, paymentMethod = 'card') => {
    const response = await api.post('/wallet/deposit', {
      amount: parseFloat(amount),
      payment_method: paymentMethod
    });
    return response.data;
  },

  withdraw: async (amount, bankAccount = 'primary') => {
    const response = await api.post('/wallet/withdraw', {
      amount: parseFloat(amount),
      bank_account: bankAccount
    });
    return response.data;
  },

  getTransactions: async (page = 1, perPage = 20) => {
    const response = await api.get('/wallet/transactions', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  investFromWallet: async (campaignId, amount) => {
    const response = await api.post('/wallet/invest', {
      campaign_id: campaignId,
      amount: parseFloat(amount)
    });
    return response.data;
  }
};

export default walletService;