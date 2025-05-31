import { writable } from 'svelte/store';
import type { User } from '$lib/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  return {
    subscribe,
    login: (user: User) => update(state => ({ 
      ...state, 
      user, 
      isAuthenticated: true,
      error: null
    })),
    logout: () => {
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cofrap_session');
      }
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false,
        error: null
      });
    },
    setLoading: (loading: boolean) => update(state => ({ 
      ...state, 
      loading 
    })),
    setError: (error: string | null) => update(state => ({
      ...state,
      error,
      loading: false
    })),
    clearError: () => update(state => ({
      ...state,
      error: null
    }))
  };
}

export const authStore = createAuthStore();
