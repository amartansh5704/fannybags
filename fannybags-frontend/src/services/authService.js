// authService.js
import api from './api';
import Cookies from 'js-cookie';

export const authService = {
  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role,
    });
    const { access_token, user_id } = response.data;
    authService.saveToken(access_token, user_id, role);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    const { access_token, user_id, role } = response.data;
    authService.saveToken(access_token, user_id, role);
    return response.data;
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('user_id');
    Cookies.remove('user_role');
  },

  saveToken: (token, userId, role) => {
    if (!token || !userId) {
      console.error('Missing token or userId');
      return;
    }
    Cookies.set('access_token', token, { expires: 30 });
    Cookies.set('user_id', String(userId), { expires: 30 }); // Ensure userId is stored as string
    Cookies.set('user_role', role, { expires: 30 });
    // Update axios default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: () => Cookies.get('access_token'),
  getUserId: () => {
    const id = Cookies.get('user_id');
    return id ? parseInt(id, 10) : null; // Convert to number when retrieving
  },
  getUserRole: () => Cookies.get('user_role'),

  // Add this method to check auth state
  isAuthenticated: () => {
    const token = Cookies.get('access_token');
    const userId = Cookies.get('user_id');
    return !!(token && userId);
  }
};