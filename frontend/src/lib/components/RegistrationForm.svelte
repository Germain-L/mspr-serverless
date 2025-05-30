<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SecureInput from './SecureInput.svelte';
  import LoadingButton from './LoadingButton.svelte';
  
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
    } else if (username.length > 50) {
      errors.username = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm() && !isLoading) {
      dispatch('submit', { username });
    }
  }
</script>

<div class="max-w-md mx-auto">
  <div class="card p-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="card-icon mx-auto bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
        <i class="fas fa-user-plus text-white"></i>
      </div>
      <h2 class="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h2>
      <p class="text-slate-600">
        Join COFRAP for secure, enterprise-grade authentication
      </p>
    </div>
    
    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <SecureInput
        id="username"
        type="text"
        label="Username"
        bind:value={username}
        error={errors.username}
        placeholder="Enter your username"
        disabled={isLoading}
        required={true}
        icon="fas fa-user"
        autocomplete="username"
      />
      
      <!-- Security Notice -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-3 flex-shrink-0"></i>
          <div class="text-sm text-blue-700">
            <p class="font-medium mb-1">Security First</p>
            <p>Your password and 2FA will be automatically generated after account creation for maximum security.</p>
          </div>
        </div>
      </div>
      
      <LoadingButton
        type="submit"
        variant="primary"
        size="lg"
        fullWidth={true}
        loading={isLoading}
        loadingText="Creating Account..."
        disabled={!username || isLoading}
      >
        <i class="fas fa-shield-alt mr-2"></i>
        Create Secure Account
      </LoadingButton>
    </form>
    
    <!-- Footer -->
    <div class="mt-6 text-center">
      <p class="text-sm text-slate-600">
        Already have an account?
        <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
          Sign in here
        </a>
      </p>
    </div>
  </div>
</div>
