<script lang="ts">
	import '../app.css';
import { authStore } from '$lib/stores/auth';
import { getVersionString } from '$lib/version';
import type { User } from '$lib/types/auth';

const { children } = $props();

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
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-cofrap-700">COFRAP Authentication</h1>
        </div>
        
        {#if auth.isAuthenticated && auth.user}
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">Welcome, {auth.user.username}</span>
            <button
              type="button"
              class="text-sm text-cofrap-600 hover:text-cofrap-700"
              onclick={() => authStore.logout()}
            >
              Logout
            </button>
          </div>
        {/if}
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
    {@render children()}
  </main>

  <!-- Footer with version info -->
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center text-sm text-gray-500">
        <div>
          © 2025 COFRAP Authentication System
        </div>
        <div class="flex items-center space-x-4">
          <span>Version {getVersionString()}</span>
          <a 
            href="/api/version" 
            target="_blank"
            class="hover:text-gray-700 underline"
            title="View detailed version info"
          >
            Build Info
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>
