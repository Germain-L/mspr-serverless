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

<div class="max-w-lg mx-auto px-4 py-8">
  {#if step === 'info'}
    <h1 class="text-center text-3xl font-semibold mb-6 text-slate-800">Reset Your Credentials</h1>
    
    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
      <p class="text-blue-900 mt-0">Your credentials have expired or need to be reset. This process will:</p>
      <ul class="mb-0 pl-6">
        <li class="mb-2 text-blue-800">Generate a new secure password for your account</li>
        <li class="mb-2 text-blue-800">Create a new two-factor authentication secret</li>
        <li class="text-blue-800">Reset your account status to active</li>
      </ul>
    </div>
    
    {#if error}
      <div class="bg-red-100 text-red-800 p-3 mb-4 rounded border border-red-200">
        {error}
      </div>
    {/if}
    
    <div class="mb-6">
      <label for="username" class="block mb-2 font-medium text-gray-700">Username</label>
      <input 
        type="text" 
        id="username" 
        bind:value={username} 
        placeholder="Enter your username"
        class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
        disabled={$isLoading}
      />
    </div>
    
    <button 
      class="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
      on:click={startReset} 
      disabled={$isLoading || !username}
    >
      {$isLoading ? 'Processing...' : 'Reset Credentials'}
    </button>
  {:else if step === 'password' && passwordData}
    <h1 class="text-center text-3xl font-semibold mb-6 text-slate-800">Save Your New Password</h1>
    
    <div class="mb-6 text-center">
      <p class="mb-2">Scan this QR code to get your new password. You will need it to log in.</p>
      <p class="mb-2"><strong>Your new password:</strong> {passwordData.password}</p>
      <p class="text-red-600 font-medium">Important: For security reasons, this password will only be shown once!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={passwordData.qr_code}
      title="Your New Password"
      instructions="Save this password in a secure password manager."
    />
    
    <button 
      class="w-full py-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors"
      on:click={proceedToTwoFactor}
    >
      I've saved my password, continue
    </button>
  {:else if step === 'twoFactor' && tfaData}
    <h1 class="text-center text-3xl font-semibold mb-6 text-slate-800">Setup New Two-Factor Authentication</h1>
    
    <div class="mb-6 text-center">
      <p class="mb-2">Scan this QR code with an authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).</p>
      <p class="text-red-600 font-medium">Important: This will replace your previous 2FA setup!</p>
    </div>
    
    <QRCodeDisplay 
      qrCodeData={tfaData.qr_code}
      title="New Two-Factor Authentication"
      instructions="Scan with your authenticator app to receive 6-digit codes"
    />
    
    <button 
      class="w-full py-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors" 
      on:click={proceedToLogin}
    >
      I've set up the new 2FA, proceed to login
    </button>
  {/if}
</div>
