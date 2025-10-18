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
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('user_id');
    Cookies.remove('user_role');
  },

  saveToken: (token, userId, role) => {
    Cookies.set('access_token', token, { expires: 30 });
    Cookies.set('user_id', userId, { expires: 30 });
    Cookies.set('user_role', role, { expires: 30 });
  },

  getToken: () => Cookies.get('access_token'),
  getUserId: () => Cookies.get('user_id'),
  getUserRole: () => Cookies.get('user_role'),
};