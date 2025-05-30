<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let isLoading = false;
  
  let username = '';
  let errors: Record<string, string> = {};
  
  const dispatch = createEventDispatcher<{
    submit: { username: string };
  }>();
  
  function validateForm(): boolean {
    errors = {};
    
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      dispatch('submit', { username });
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
      placeholder="Enter your username"
    />
    {#if errors.username}
      <span class="block text-red-500 text-sm mt-1">{errors.username}</span>
    {/if}
  </div>
  
  <button 
    type="submit" 
    disabled={isLoading}
    class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Creating Account...' : 'Create Account'}
  </button>
</form>
