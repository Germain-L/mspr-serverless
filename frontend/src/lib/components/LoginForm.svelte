<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let isLoading = false;
  
  let username = '';
  let password = '';
  let tfaCode = '';
  let errors: Record<string, string> = {};
  
  const dispatch = createEventDispatcher<{
    submit: { username: string; password: string; tfaCode: string };
  }>();
  
  function validateForm(): boolean {
    errors = {};
    
    if (!username) {
      errors.username = 'Username is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    if (!tfaCode) {
      errors.tfaCode = 'Two-factor authentication code is required';
    } else if (!/^\d{6}$/.test(tfaCode)) {
      errors.tfaCode = 'TFA code must be 6 digits';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      dispatch('submit', { username, password, tfaCode });
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
  <div class="mb-4">
    <label for="username" class="block mb-2 font-medium text-gray-700">Username</label>
    <input 
      id="username" 
      type="text" 
      bind:value={username}
      class={`w-full px-3 py-2 border rounded-md text-base ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
      disabled={isLoading}
    />
    {#if errors.username}
      <span class="block text-red-500 text-sm mt-1">{errors.username}</span>
    {/if}
  </div>
  
  <div class="mb-4">
    <label for="password" class="block mb-2 font-medium text-gray-700">Password</label>
    <input 
      id="password" 
      type="password" 
      bind:value={password}
      class={`w-full px-3 py-2 border rounded-md text-base ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
      disabled={isLoading}
    />
    {#if errors.password}
      <span class="block text-red-500 text-sm mt-1">{errors.password}</span>
    {/if}
  </div>
  
  <div class="mb-6">
    <label for="tfaCode" class="block mb-2 font-medium text-gray-700">Two-Factor Authentication Code</label>
    <input 
      id="tfaCode" 
      type="text" 
      bind:value={tfaCode}
      placeholder="6-digit code"
      class={`w-full px-3 py-2 border rounded-md text-base ${errors.tfaCode ? 'border-red-500' : 'border-gray-300'}`}
      disabled={isLoading}
    />
    {#if errors.tfaCode}
      <span class="block text-red-500 text-sm mt-1">{errors.tfaCode}</span>
    {/if}
  </div>
  
  <button 
    type="submit" 
    disabled={isLoading}
    class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Logging in...' : 'Login'}
  </button>
</form>
