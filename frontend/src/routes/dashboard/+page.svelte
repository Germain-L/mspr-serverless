<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import { authStore } from '$lib/stores/auth';
  import type { User } from '$lib/types/auth';

  interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  }

  let auth = $state<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  // Subscribe to auth store changes
  authStore.subscribe(value => {
    auth = value;
  });

  // Redirect to login if not authenticated
  onMount(() => {
    if (!auth?.isAuthenticated) {
      goto('/');
    }
  });

  function logout() {
    authStore.logout();
    goto('/');
  }

  function setup2FA() {
    if (auth?.user) {
      goto(`/setup-2fa?username=${encodeURIComponent(auth.user.username)}`);
    }
  }
</script>

<svelte:head>
  <title>Dashboard - COFRAP</title>
</svelte:head>

{#if auth?.isAuthenticated && auth?.user}
  <div class="max-w-4xl mx-auto">
    <!-- Welcome Section -->
    <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p class="mt-1 text-gray-600">You are successfully authenticated to COFRAP.</p>
          </div>
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Information -->
    <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Account Information</h3>
        
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Username</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono">{auth?.user?.username}</dd>
          </div>
          
          <div>
            <dt class="text-sm font-medium text-gray-500">User ID</dt>
            <dd class="mt-1 text-sm text-gray-900">{auth?.user?.id}</dd>
          </div>
          
          <div>
            <dt class="text-sm font-medium text-gray-500">Two-Factor Authentication</dt>
            <dd class="mt-1 text-sm">
              {#if auth?.user?.has_2fa}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Enabled
                </span>
              {:else}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Not Enabled
                </span>
              {/if}
            </dd>
          </div>
          
          <div>
            <dt class="text-sm font-medium text-gray-500">Account Status</dt>
            <dd class="mt-1 text-sm">
              {#if auth?.user?.expired}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Expired
                </span>
              {:else}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Active
                </span>
              {/if}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Security Section -->
    <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Security Settings</h3>
        
        {#if !auth?.user?.has_2fa}
          <Alert 
            type="warning" 
            message="Consider enabling Two-Factor Authentication for enhanced security." 
          />
          
          <div class="mt-4">
            <Button onclick={setup2FA}>
              Setup 2FA
            </Button>
          </div>
        {:else}
          <Alert 
            type="success" 
            message="Your account is secured with Two-Factor Authentication." 
          />
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Account Actions</h3>
        
        <div class="space-y-3">
          <Button variant="danger" onclick={logout} class="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Loading or redirect state -->
  <div class="flex items-center justify-center min-h-64">
    <div class="text-center">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-cofrap-600 bg-white">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-cofrap-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Redirecting...
      </div>
    </div>
  </div>
{/if}
