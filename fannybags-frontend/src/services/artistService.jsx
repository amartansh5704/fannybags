import api from './api';

export const artistService = {
  getArtistProfile: async (artistId) => {
    const response = await api.get(`/artist/profile/${artistId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/artist/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/artist/profile', profileData);
    return response.data;
  },

  uploadProfileImage: async (formData) => {
    const response = await api.post('/artist/profile/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};