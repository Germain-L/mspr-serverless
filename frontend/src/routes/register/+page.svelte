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

<div class="max-w-lg mx-auto px-4 py-8">
  {#if step === 'form'}
    <h1 class="text-center text-3xl font-semibold mb-6 text-slate-800">Create a New Account</h1>
    
    {#if error}
      <div class="bg-red-100 text-red-800 p-3 mb-4 rounded border border-red-200">
        {error}
      </div>
    {/if}
    
    <RegistrationForm 
      on:submit={handleRegistration}
      isLoading={$isLoading}
    />
    
    <div class="mt-6 text-center">
      <p>Already have an account? <a href="/login" class="text-blue-500 hover:underline">Login</a></p>
    </div>
  {:else if step === 'password' && passwordData}
    <h1 class="text-center text-3xl font-semibold mb-6 text-slate-800">Save Your Password</h1>
    
    <div class="mb-6 text-center">
      <p class="mb-2">Scan this QR code to get your password. You will need it to log in.</p>
      <p class="mb-2"><strong>Your password:</strong> {passwordData.password}</p>
      <p class="text-red-600 font-medium">Important: For security reasons, this password will only be shown once!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={passwordData.qr_code}
      title="Your Generated Password"
      instructions="Save this password in a secure password manager."
    />
    
    <button 
      class="w-full py-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors" 
      on:click={proceedToTwoFactor}
    >
      I've saved my password, continue
    </button>
  {:else if step === 'twoFactor' && tfaData}
    <h1 class="text-center text-3xl font-semibold mb-6 text-slate-800">Setup Two-Factor Authentication</h1>
    
    <div class="mb-6 text-center">
      <p class="mb-2">Scan this QR code with an authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).</p>
      <p class="text-red-600 font-medium">Important: You will need this for every login!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={tfaData.qr_code}
      title="Two-Factor Authentication"
      instructions="Scan with your authenticator app to receive 6-digit codes"
    />
    
    <button 
      class="w-full py-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors" 
      on:click={proceedToLogin}
    >
      I've set up 2FA, proceed to login
    </button>
  {/if}
</div>
