import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setAccessToken } from '../utils/api';
import { User, AuthResponse } from '../types';
import { toast } from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
          });

          const { user, accessToken } = response.data;
          
          setAccessToken(accessToken);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          toast.success('Welcome back!');
        } catch (error: any) {
          const message = error.response?.data?.error || 'Login failed';
          set({ 
            error: message, 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post<AuthResponse>('/auth/register', {
            email,
            password,
            name,
          });

          const { user, accessToken } = response.data;
          
          setAccessToken(accessToken);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          toast.success('Account created successfully!');
        } catch (error: any) {
          const message = error.response?.data?.error || 'Registration failed';
          set({ 
            error: message, 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout error:', error);
        } finally {
          setAccessToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null,
          });
          
          toast.success('Logged out successfully');
        }
      },

      refreshAuth: async () => {
        set({ isLoading: true });
        
        try {
          const response = await api.post<AuthResponse>('/auth/refresh');
          const { user, accessToken } = response.data;
          
          setAccessToken(accessToken);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          setAccessToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);