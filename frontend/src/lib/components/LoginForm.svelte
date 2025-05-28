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

<form on:submit|preventDefault={handleSubmit} class="login-form">
  <div class="form-group">
    <label for="username">Username</label>
    <input 
      id="username" 
      type="text" 
      bind:value={username}
      class:error={errors.username}
      disabled={isLoading}
    />
    {#if errors.username}
      <span class="error-message">{errors.username}</span>
    {/if}
  </div>
  
  <div class="form-group">
    <label for="password">Password</label>
    <input 
      id="password" 
      type="password" 
      bind:value={password}
      class:error={errors.password}
      disabled={isLoading}
    />
    {#if errors.password}
      <span class="error-message">{errors.password}</span>
    {/if}
  </div>
  
  <div class="form-group">
    <label for="tfaCode">Two-Factor Authentication Code</label>
    <input 
      id="tfaCode" 
      type="text" 
      bind:value={tfaCode}
      placeholder="6-digit code"
      class:error={errors.tfaCode}
      disabled={isLoading}
    />
    {#if errors.tfaCode}
      <span class="error-message">{errors.tfaCode}</span>
    {/if}
  </div>
  
  <button type="submit" disabled={isLoading}>
    {isLoading ? 'Logging in...' : 'Login'}
  </button>
</form>

<style>
  .login-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 1rem;
  }
  
  input.error {
    border-color: #e53e3e;
  }
  
  .error-message {
    display: block;
    color: #e53e3e;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #3182ce;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
