import api from './api';

export const campaignService = {
  getAllCampaigns: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },

  getCampaignById: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (campaignData) => {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  },

  buyCampaign: async (campaignId, partitionsCount) => {
    const response = await api.post(`/campaigns/${campaignId}/buy`, {
      partitions_count: partitionsCount,
      payment_method: 'card',
    });
    return response.data;
  },

  getAnalytics: async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}/analytics`);
    return response.data;
  },
};