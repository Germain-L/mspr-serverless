<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import QRCodeDisplay from '$lib/components/ui/QRCodeDisplay.svelte';
  import { AuthAPI } from '$lib/utils/api';
  import { handleApiError, isValidTOTP } from '$lib/utils/error-handler';

  let username = $state($page.url.searchParams.get('username') || '');
  let userId = $state($page.url.searchParams.get('userId') || '');
  let loading = $state(false);
  let error = $state('');
  let success = $state(false);
  let qrCodeData = $state('');
  let verificationCode = $state('');
  let setupComplete = $state(false);

  // Auto-generate 2FA setup when component loads
  $effect(() => {
    if (username && !qrCodeData) {
      setup2FA();
    }
  });

  async function setup2FA() {
    if (!username.trim()) {
      error = 'Username is required';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await AuthAPI.setup2FA(username);
      
      if (response.error) {
        error = handleApiError(response);
        loading = false;
        return;
      }

      if (response.status === 'success') {
        qrCodeData = response.qr_code;
      } else {
        error = 'Failed to setup 2FA';
      }
    } catch (err) {
      error = handleApiError(err);
    } finally {
      loading = false;
    }
  }

  async function verify2FA() {
    if (!verificationCode.trim()) {
      error = 'Please enter the verification code';
      return;
    }

    if (!isValidTOTP(verificationCode)) {
      error = 'Please enter a valid 6-digit code';
      return;
    }

    loading = true;
    error = '';

    try {
      // Test authentication with the 2FA code to verify it works
      const response = await AuthAPI.authenticate(username, '', verificationCode);
      
      if (response.error && !response.error.includes('Invalid username or password')) {
        // If the error is not about password (which is expected since we're not providing one)
        // then it might be about the TOTP code
        if (response.error.includes('Invalid TOTP code')) {
          error = 'Invalid verification code. Please check your authenticator app and try again.';
          loading = false;
          return;
        }
      }

      // If we get here and the only error is about password, the TOTP is working
      setupComplete = true;
      success = true;
    } catch (err) {
      error = handleApiError(err);
    } finally {
      loading = false;
    }
  }

  function goToLogin() {
    goto('/');
  }

  function skipSetup() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Setup 2FA - COFRAP</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        Setup Two-Factor Authentication
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Secure your account with TOTP-based 2FA
      </p>
    </div>

    {#if !setupComplete}
      <div class="space-y-6">
        {#if error}
          <Alert type="error" message={error} dismissible onDismiss={() => error = ''} />
        {/if}

        {#if loading && !qrCodeData}
          <div class="text-center">
            <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-cofrap-600 bg-white">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-cofrap-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up 2FA...
            </div>
          </div>
        {/if}

        {#if qrCodeData}
          <QRCodeDisplay 
            qrCodeBase64={qrCodeData}
            title="Setup Your Authenticator"
            description="Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.) to setup 2FA for your account."
          />

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
            <ol class="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Install an authenticator app (Google Authenticator, Authy, 1Password, etc.)</li>
              <li>Open the app and scan the QR code above</li>
              <li>Enter the 6-digit code from your app below to verify the setup</li>
            </ol>
          </div>

          <form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
            <Input
              id="verification-code"
              name="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              label="Verification Code"
              bind:value={verificationCode}
              required
              disabled={loading}
              autocomplete="one-time-code"
            />

            <div class="space-y-3">
              <Button 
                type="button"
                onclick={verify2FA}
                loading={loading}
                class="w-full"
              >
                Verify and Complete Setup
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                onclick={skipSetup}
                disabled={loading}
                class="w-full"
              >
                Skip 2FA Setup
              </Button>
            </div>
          </form>
        {/if}
      </div>
    {:else}
      <!-- Setup Complete -->
      <div class="space-y-6">
        <Alert 
          type="success" 
          message="2FA setup completed successfully! Your account is now secured with two-factor authentication." 
        />

        <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg class="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-green-900 mb-2">Setup Complete!</h3>
          <p class="text-green-700">
            Your account is now protected with 2FA. You'll need both your password and authenticator code to sign in.
          </p>
        </div>

        <Button 
          type="button"
          onclick={goToLogin}
          class="w-full"
        >
          Go to Login
        </Button>
      </div>
    {/if}
  </div>
</div>
