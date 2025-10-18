import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, password);
      authService.saveToken(data.access_token, data.user_id, data.role);
      set({
        user: { id: data.user_id, email: data.email, role: data.role },
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(name, email, password, role);
      authService.saveToken(data.access_token, data.user_id, data.role);
      set({
        user: { id: data.user_id, email: data.email, role: data.role },
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const token = authService.getToken();
    const userId = authService.getUserId();
    const userRole = authService.getUserRole();
    if (token) {
      set({
        user: { id: userId, role: userRole },
        isAuthenticated: true,
      });
    }
  },
}));