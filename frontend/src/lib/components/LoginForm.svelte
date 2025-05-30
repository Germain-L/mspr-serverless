<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SecureInput from './SecureInput.svelte';
  import LoadingButton from './LoadingButton.svelte';
  
  export let isLoading = false;
  export let error: string | null = null;
  
  let username = '';
  let password = '';
  let tfaCode = '';
  let errors: Record<string, string> = {};
  let rememberMe = false;
  
  const dispatch = createEventDispatcher<{
    submit: { username: string; password: string; tfaCode: string };
  }>();
  
  function validateForm(): boolean {
    errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!tfaCode.trim()) {
      errors.tfaCode = 'Two-factor authentication code is required';
    } else if (!/^\d{6}$/.test(tfaCode.trim())) {
      errors.tfaCode = 'TFA code must be exactly 6 digits';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      dispatch('submit', { 
        username: username.trim(), 
        password, 
        tfaCode: tfaCode.trim() 
      });
    }
  }
  
  function clearError(field: string) {
    if (errors[field]) {
      delete errors[field];
      errors = { ...errors };
    }
  }
</script>

<div class="auth-form-container">
  <form on:submit|preventDefault={handleSubmit} class="auth-form" novalidate>
    <!-- Error Alert -->
    {#if error}
      <div class="alert alert-error" role="alert">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <span>{error}</span>
      </div>
    {/if}
    
    <!-- Username Field -->
    <div class="form-group">
      <label for="login-username" class="form-label">
        <i class="fas fa-user" aria-hidden="true"></i>
        Username
      </label>
      <input 
        id="login-username" 
        type="text" 
        bind:value={username}
        oninput={() => clearError('username')}
        class="form-input"
        class:error={errors.username}
        placeholder="Enter your username"
        disabled={isLoading}
        autocomplete="username"
        required
        aria-describedby={errors.username ? 'username-error' : undefined}
      />
      {#if errors.username}
        <div id="username-error" class="form-error" role="alert">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          {errors.username}
        </div>
      {/if}
    </div>
    
    <!-- Password Field -->
    <div class="form-group">
      <label for="login-password" class="form-label">
        <i class="fas fa-lock" aria-hidden="true"></i>
        Password
      </label>
      <SecureInput 
        id="login-password"
        bind:value={password}
        placeholder="Enter your password"
        disabled={isLoading}
        error={errors.password}
        autocomplete="current-password"
        oninput={() => clearError('password')}
        required
      />
      {#if errors.password}
        <div class="form-error" role="alert">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          {errors.password}
        </div>
      {/if}
    </div>
    
    <!-- 2FA Code Field -->
    <div class="form-group">
      <label for="login-tfa" class="form-label">
        <i class="fas fa-mobile-alt" aria-hidden="true"></i>
        Two-Factor Authentication Code
      </label>
      <input 
        id="login-tfa" 
        type="text" 
        bind:value={tfaCode}
        oninput={() => clearError('tfaCode')}
        class="form-input tfa-input"
        class:error={errors.tfaCode}
        placeholder="000000"
        maxlength="6"
        pattern="[0-9]{6}"
        disabled={isLoading}
        autocomplete="one-time-code"
        required
        aria-describedby={errors.tfaCode ? 'tfa-error' : 'tfa-help'}
      />
      <div id="tfa-help" class="form-help">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        Enter the 6-digit code from your authenticator app
      </div>
      {#if errors.tfaCode}
        <div id="tfa-error" class="form-error" role="alert">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          {errors.tfaCode}
        </div>
      {/if}
    </div>
    
    <!-- Remember Me -->
    <div class="form-group">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          bind:checked={rememberMe}
          class="checkbox-input"
          disabled={isLoading}
        />
        <span class="checkbox-custom"></span>
        <span class="checkbox-text">Remember me for 30 days</span>
      </label>
    </div>
    
    <!-- Submit Button -->
    <div class="form-actions">
      <LoadingButton 
        type="submit"
        variant="security"
        size="lg"
        fullWidth={true}
        loading={isLoading}
        disabled={isLoading || Object.keys(errors).length > 0}
      >
        <i class="fas fa-sign-in-alt" slot="icon" aria-hidden="true"></i>
        {isLoading ? 'Signing In...' : 'Sign In Securely'}
      </LoadingButton>
    </div>
    
    <!-- Security Notice -->
    <div class="security-footer">
      <div class="security-item">
        <i class="fas fa-shield-check" aria-hidden="true"></i>
        <span>Protected by 2FA</span>
      </div>
      <div class="security-item">
        <i class="fas fa-eye-slash" aria-hidden="true"></i>
        <span>Zero-knowledge encryption</span>
      </div>
    </div>
  </form>
</div>
