<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import { AuthAPI } from '$lib/utils/api';
  import { handleApiError, isValidUsername } from '$lib/utils/error-handler';
  import { authStore } from '$lib/stores/auth';
  import type { User } from '$lib/types/auth';

  let username = $state('');
  let password = $state('');
  let totpCode = $state('');
  let loading = $state(false);
  let error = $state('');
  let showPasswordField = $state(false);
  let showTotpField = $state(false);
  let userExists = $state(false);
  let userExpired = $state(false);

  async function checkUser() {
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
      const response = await AuthAPI.checkUserStatus(username);
      
      if (response.error) {
        error = handleApiError(response);
        loading = false;
        return;
      }

      userExists = response.exists;
      userExpired = response.expired;
      
      if (response.exists) {
        showPasswordField = true;
        if (response.has_2fa) {
          showTotpField = true;
        }
      } else {
        // User doesn't exist, offer to create account
        showPasswordField = false;
        showTotpField = false;
      }
    } catch (err) {
      error = handleApiError(err);
    } finally {
      loading = false;
    }
  }

  async function handleLogin() {
    if (!password.trim()) {
      error = 'Please enter your password';
      return;
    }

    if (showTotpField && !totpCode.trim()) {
      error = 'Please enter your 2FA code';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await AuthAPI.authenticate(username, password, totpCode || undefined);
      
      if (response.error) {
        error = handleApiError(response);
        loading = false;
        return;
      }

      if (response.status === 'success' && response.user_id) {
        const user: User = {
          id: response.user_id,
          username: username,
          has_2fa: response.has_2fa || false,
          expired: false
        };
        
        authStore.login(user);
        goto('/dashboard');
      } else {
        error = response.message || 'Authentication failed';
      }
    } catch (err) {
      error = handleApiError(err);
    } finally {
      loading = false;
    }
  }

  function createAccount() {
    goto(`/register?username=${encodeURIComponent(username)}`);
  }

  function resetForm() {
    username = '';
    password = '';
    totpCode = '';
    showPasswordField = false;
    showTotpField = false;
    userExists = false;
    userExpired = false;
    error = '';
  }
</script>

<svelte:head>
  <title>COFRAP Authentication</title>
  <meta name="description" content="Secure authentication system for COFRAP" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your username to get started
      </p>
    </div>

    <form class="mt-8 space-y-6" onsubmit={(e) => e.preventDefault()}>
      {#if error}
        <Alert type="error" message={error} dismissible onDismiss={() => error = ''} />
      {/if}

      {#if userExpired}
        <Alert 
          type="warning" 
          message="Your account has expired. Please create a new account or contact support." 
        />
      {/if}

      <div class="space-y-4">
        <!-- Username Field -->
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          label="Username"
          bind:value={username}
          required
          disabled={loading || showPasswordField}
          autocomplete="username"
        />

        {#if !showPasswordField && username.trim()}
          <Button 
            type="button"
            onclick={checkUser}
            loading={loading}
            class="w-full"
          >
            Continue
          </Button>
        {/if}

        <!-- Password Field (shown after username check) -->
        {#if showPasswordField}
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            label="Password"
            bind:value={password}
            required
            disabled={loading}
            autocomplete="current-password"
          />
        {/if}

        <!-- 2FA Field (shown if user has 2FA enabled) -->
        {#if showTotpField}
          <Input
            id="totp"
            name="totp"
            type="text"
            placeholder="Enter 6-digit code"
            label="2FA Authentication Code"
            bind:value={totpCode}
            required
            disabled={loading}
            autocomplete="one-time-code"
          />
        {/if}

        <!-- Action Buttons -->
        {#if showPasswordField}
          <div class="space-y-3">
            <Button 
              type="button"
              onclick={handleLogin}
              loading={loading}
              class="w-full"
            >
              Sign In
            </Button>
            
            <Button 
              type="button"
              variant="ghost"
              onclick={resetForm}
              disabled={loading}
              class="w-full"
            >
              Start Over
            </Button>
          </div>
        {/if}
      </div>

      <!-- Create Account Section -->
      {#if !userExists && username.trim() && !showPasswordField}
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-3">
            Username "{username}" is available
          </p>
          <Button 
            type="button"
            variant="secondary"
            onclick={createAccount}
            disabled={loading}
            class="w-full"
          >
            Create New Account
          </Button>
        </div>
      {/if}
    </form>
  </div>
</div>
