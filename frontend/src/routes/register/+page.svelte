<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import QRCodeDisplay from '$lib/components/ui/QRCodeDisplay.svelte';
  import { AuthAPI } from '$lib/utils/api';
  import { handleApiError, isValidUsername } from '$lib/utils/error-handler';

  let username = $state($page.url.searchParams.get('username') || '');
  let loading = $state(false);
  let error = $state('');
  let success = $state(false);
  let generatedPassword = $state('');
  let qrCodeData = $state('');
  let userId = $state<number | null>(null);

  async function createUser() {
    if (!username.trim()) {
      error = 'Please enter a username';
      return;
    }

    if (!isValidUsername(username)) {
      error = 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await AuthAPI.createUser(username);
      
      if (response.error) {
        error = handleApiError(response);
        loading = false;
        return;
      }

      if (response.status === 'success') {
        success = true;
        generatedPassword = response.password;
        qrCodeData = response.qr_code;
        userId = response.user_id;
      } else {
        error = 'Failed to create user account';
      }
    } catch (err) {
      error = handleApiError(err);
    } finally {
      loading = false;
    }
  }

  function proceedTo2FA() {
    goto(`/setup-2fa?username=${encodeURIComponent(username)}&userId=${userId}`);
  }

  function goToLogin() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Create Account - COFRAP</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        Create New Account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter a username to create your COFRAP account
      </p>
    </div>

    {#if !success}
      <form class="mt-8 space-y-6" onsubmit={(e) => e.preventDefault()}>
        {#if error}
          <Alert type="error" message={error} dismissible onDismiss={() => error = ''} />
        {/if}

        <div class="space-y-4">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            label="Username"
            bind:value={username}
            required
            disabled={loading}
            autocomplete="username"
          />

          <Button 
            type="button"
            variant="primary"
            onclick={createUser}
            loading={loading}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            Create Account
          </Button>

          <Button 
            type="button"
            variant="ghost"
            onclick={goToLogin}
            disabled={loading}
            class="w-full"
          >
            Back to Login
          </Button>
        </div>
      </form>
    {:else}
      <!-- Success State - Show Generated Password -->
      <div class="space-y-6">
        <Alert 
          type="success" 
          message="Account created successfully! Please save your password securely." 
        />

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Your Account Details</h3>
          
          <div class="space-y-4">
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-1">Username</div>
              <p class="text-lg font-mono bg-gray-50 p-2 rounded border">{username}</p>
            </div>
            
            <div>
              <div class="block text-sm font-medium text-gray-700 mb-1">Generated Password</div>
              <p class="text-lg font-mono bg-gray-50 p-2 rounded border break-all">{generatedPassword}</p>
            </div>
          </div>
        </div>

        {#if qrCodeData}
          <QRCodeDisplay 
            qrCodeBase64={qrCodeData}
            title="Save Your Password"
            description="Scan this QR code to save your login credentials securely. You'll need both your username and password to sign in."
          />
        {/if}

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Important Security Notice</h3>
              <p class="mt-1 text-sm text-yellow-700">
                Save your password securely! This is the only time it will be displayed. 
                Consider setting up 2FA for additional security.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <Button 
            type="button"
            onclick={proceedTo2FA}
            class="w-full"
          >
            Setup 2FA (Recommended)
          </Button>
          
          <Button 
            type="button"
            variant="secondary"
            onclick={goToLogin}
            class="w-full"
          >
            Skip and Go to Login
          </Button>
        </div>
      </div>
    {/if}
  </div>
</div>
