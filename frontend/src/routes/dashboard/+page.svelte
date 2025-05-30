<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, isAuthenticated } from '$lib/stores/auth';
  
  onMount(() => {
    // Redirect to login if not authenticated
    if (!$isAuthenticated) {
      goto('/login');
    }
  });
</script>

<div class="max-w-3xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-semibold mb-8 text-slate-800">User Dashboard</h1>
  
  {#if $user}
    <div class="bg-gray-50 rounded-lg p-6 mb-8 shadow-sm">
      <h2 class="text-2xl font-semibold text-slate-800 mt-0">Welcome, {$user.username}!</h2>
      <p class="text-gray-600">Your account is active and secure.</p>
    </div>
    
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-slate-800">Account Security Status</h3>
      <ul class="list-none p-0 m-0">
        <li class="flex items-start mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <span class="text-2xl mr-4">✅</span>
          <div>
            <h4 class="text-lg font-medium mb-2 text-slate-800">Secure Password</h4>
            <p class="text-gray-600">Your account is protected with a strong, secure password.</p>
          </div>
        </li>
        <li class="flex items-start mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <span class="text-2xl mr-4">✅</span>
          <div>
            <h4 class="text-lg font-medium mb-2 text-slate-800">Two-Factor Authentication</h4>
            <p class="text-gray-600">Your account is protected with two-factor authentication.</p>
          </div>
        </li>
      </ul>
    </div>
    
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4 text-slate-800">Account Actions</h3>
      <a href="/reset" class="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-slate-800 font-medium rounded transition-colors">Reset Credentials</a>
    </div>
  {:else}
    <p class="text-gray-600">Loading user information...</p>
  {/if}
</div>
