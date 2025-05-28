<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { isLoading, setError } from '$lib/stores/auth';
  import { passwordService, twoFactorService } from '$lib/services/api';
  import QRCodeDisplay from '$lib/components/QRCodeDisplay.svelte';
  
  let step: 'info' | 'password' | 'twoFactor' = 'info';
  let error: string | null = null;
  let username = '';
  let passwordData: { qr_code: string; password: string } | null = null;
  let tfaData: { qr_code: string } | null = null;
  
  onMount(() => {
    // Get username from URL query parameter if present
    const urlUsername = $page.url.searchParams.get('username');
    if (urlUsername) {
      username = urlUsername;
    }
  });
  
  async function startReset() {
    if (!username) {
      error = 'Username is required to reset credentials';
      return;
    }
    
    error = null;
    isLoading.set(true);
    
    try {
      // Generate new password
      passwordData = await passwordService.generate(username);
      step = 'password';
      
      // Pre-fetch 2FA data
      tfaData = await twoFactorService.generate(username);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred while resetting credentials';
      setError(error);
    } finally {
      isLoading.set(false);
    }
  }
  
  function proceedToTwoFactor() {
    if (tfaData) {
      step = 'twoFactor';
    }
  }
  
  function proceedToLogin() {
    goto('/login');
  }
</script>

<div class="reset-container">
  {#if step === 'info'}
    <h1>Reset Your Credentials</h1>
    
    <div class="info-box">
      <p>Your credentials have expired or need to be reset. This process will:</p>
      <ul>
        <li>Generate a new secure password for your account</li>
        <li>Create a new two-factor authentication secret</li>
        <li>Reset your account status to active</li>
      </ul>
    </div>
    
    {#if error}
      <div class="error-alert">
        {error}
      </div>
    {/if}
    
    <div class="form-group">
      <label for="username">Username</label>
      <input 
        type="text" 
        id="username" 
        bind:value={username} 
        placeholder="Enter your username"
        disabled={$isLoading}
      />
    </div>
    
    <button 
      class="btn btn-primary" 
      on:click={startReset} 
      disabled={$isLoading || !username}
    >
      {$isLoading ? 'Processing...' : 'Reset Credentials'}
    </button>
  {:else if step === 'password' && passwordData}
    <h1>Save Your New Password</h1>
    
    <div class="step-info">
      <p>Scan this QR code to get your new password. You will need it to log in.</p>
      <p><strong>Your new password:</strong> {passwordData.password}</p>
      <p class="warning">Important: For security reasons, this password will only be shown once!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={passwordData.qr_code}
      title="Your New Password"
      instructions="Save this password in a secure password manager."
    />
    
    <button class="btn btn-primary" on:click={proceedToTwoFactor}>
      I've saved my password, continue
    </button>
  {:else if step === 'twoFactor' && tfaData}
    <h1>Setup New Two-Factor Authentication</h1>
    
    <div class="step-info">
      <p>Scan this QR code with an authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).</p>
      <p class="warning">Important: This will replace your previous 2FA setup!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={tfaData.qr_code}
      title="New Two-Factor Authentication"
      instructions="Scan with your authenticator app to receive 6-digit codes"
    />
    
    <button class="btn btn-primary" on:click={proceedToLogin}>
      I've set up the new 2FA, proceed to login
    </button>
  {/if}
</div>

<style>
  .reset-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  
  .info-box {
    background-color: #e1f5fe;
    border-left: 4px solid #03a9f4;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 0.25rem;
  }
  
  .info-box p {
    margin-top: 0;
    color: #01579b;
  }
  
  .info-box ul {
    margin-bottom: 0;
    padding-left: 1.5rem;
  }
  
  .info-box li {
    margin-bottom: 0.5rem;
    color: #0277bd;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 1rem;
  }
  
  .error-alert {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #f5c6cb;
  }
  
  .step-info {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .warning {
    color: #e74c3c;
    font-weight: 500;
  }
  
  .btn {
    display: block;
    width: 100%;
    padding: 0.75rem 1.5rem;
    margin-top: 1rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #2980b9;
  }
</style>
