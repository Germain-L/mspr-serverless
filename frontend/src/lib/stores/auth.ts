import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: number;
  username: string;
}

// Create a custom store that syncs with localStorage
function createUserStore() {
  // Initialize from localStorage if in browser environment
  let initialValue: User | null = null;
  
  if (browser) {
    const stored = localStorage.getItem('cofrap_user');
    if (stored) {
      try {
        initialValue = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
      }
    }
  }
  
  const { subscribe, set, update } = writable<User | null>(initialValue);
  
  return {
    subscribe,
    set: (value: User | null) => {
      if (browser) {
        if (value) {
          localStorage.setItem('cofrap_user', JSON.stringify(value));
        } else {
          localStorage.removeItem('cofrap_user');
        }
      }
      set(value);
    },
    update
  };
}

// User store containing information about the logged-in user
export const user = createUserStore();

// Authentication status
export const isAuthenticated = derived(
  user,
  $user => $user !== null
);

// Error messages from authentication attempts
export const authError: Writable<string | null> = writable(null);

// Loading state for auth operations
export const isLoading: Writable<boolean> = writable(false);

/**
 * Login a user by setting user data in the store
 */
export function login(userData: User): void {
  user.set(userData);
  authError.set(null);
}

/**
 * Logout the current user
 */
export function logout(): void {
  user.set(null);
  authError.set(null);
}

/**
 * Set an authentication error
 */
export function setError(message: string): void {
  authError.set(message);
}

/**
 * Clear any authentication errors
 */
export function clearError(): void {
  authError.set(null);
}
