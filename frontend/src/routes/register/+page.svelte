<script lang="ts">
  import { goto } from '$app/navigation';
  import { isLoading } from '$lib/stores/auth';
  import { passwordService, twoFactorService } from '$lib/services/api';
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  import QRCodeDisplay from '$lib/components/QRCodeDisplay.svelte';
  
  let step: 'form' | 'password' | 'twoFactor' = 'form';
  let error: string | null = null;
  let username = '';
  let passwordData: { qr_code: string; password: string } | null = null;
  let tfaData: { qr_code: string } | null = null;
  
  async function handleRegistration({ detail }: CustomEvent<{ username: string }>) {
    error = null;
    isLoading.set(true);
    username = detail.username;
    
    try {
      // Generate password
      passwordData = await passwordService.generate(username);
      step = 'password';
      
      // Pre-fetch 2FA data
      tfaData = await twoFactorService.generate(username);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred during registration';
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

<div class="registration-container">
  {#if step === 'form'}
    <h1>Create a New Account</h1>
    
    {#if error}
      <div class="error-alert">
        {error}
      </div>
    {/if}
    
    <RegistrationForm 
      on:submit={handleRegistration}
      isLoading={$isLoading}
    />
    
    <div class="auth-links">
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  {:else if step === 'password' && passwordData}
    <h1>Save Your Password</h1>
    
    <div class="step-info">
      <p>Scan this QR code to get your password. You will need it to log in.</p>
      <p><strong>Your password:</strong> {passwordData.password}</p>
      <p class="warning">Important: For security reasons, this password will only be shown once!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={passwordData.qr_code}
      title="Your Generated Password"
      instructions="Save this password in a secure password manager."
    />
    
    <button class="btn btn-primary" on:click={proceedToTwoFactor}>
      I've saved my password, continue
    </button>
  {:else if step === 'twoFactor' && tfaData}
    <h1>Setup Two-Factor Authentication</h1>
    
    <div class="step-info">
      <p>Scan this QR code with an authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).</p>
      <p class="warning">Important: You will need this for every login!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={tfaData.qr_code}
      title="Two-Factor Authentication"
      instructions="Scan with your authenticator app to receive 6-digit codes"
    />
    
    <button class="btn btn-primary" on:click={proceedToLogin}>
      I've set up 2FA, proceed to login
    </button>
  {/if}
</div>

<style>
  .registration-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  
  .error-alert {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #f5c6cb;
  }
  
  .auth-links {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .auth-links a {
    color: #3498db;
    text-decoration: none;
  }
  
  .auth-links a:hover {
    text-decoration: underline;
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
    margin: 1.5rem 0 0;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2980b9;
  }
</style>
