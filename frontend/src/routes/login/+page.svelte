<script lang="ts">
  import { goto } from '$app/navigation';
  import { isLoading, setError, login } from '$lib/stores/auth';
  import { authService } from '$lib/services/api';
  import LoginForm from '$lib/components/LoginForm.svelte';
  import { addNotification } from '$lib/stores/notification';
  
  let error: string | null = null;
  
  async function handleLogin({ detail }: CustomEvent<{ username: string; password: string; tfaCode: string }>) {
    error = null;
    isLoading.set(true);
    
    try {
      const response = await authService.authenticate(
        detail.username,
        detail.password,
        detail.tfaCode
      );
      
      if (response.expired) {
        // Redirect to reset credentials page if credentials are expired
        addNotification({
          type: 'warning',
          message: 'Your credentials have expired. Please reset them.',
          timeout: 5000
        });
        goto('/reset?username=' + encodeURIComponent(detail.username));
      } else {
        // Login successful, update auth store and navigate to dashboard
        login({
          id: response.user_id,
          username: response.username
        });
        
        addNotification({
          type: 'success',
          message: `Welcome back, ${response.username}!`,
          timeout: 3000
        });
        
        goto('/dashboard');
      }
    } catch (err) {
      // Handle login error
      error = err instanceof Error ? err.message : 'An error occurred during login';
      setError(error);
      
      addNotification({
        type: 'error',
        message: error,
        timeout: 5000
      });
    } finally {
      isLoading.set(false);
    }
  }
</script>

<svelte:head>
  <title>Login - COFRAP User Management</title>
  <meta name="description" content="Secure login to your COFRAP account with two-factor authentication">
</svelte:head>

<div class="auth-page">
  <div class="auth-container">
    <!-- Header Section -->
    <div class="auth-header">
      <div class="auth-icon">
        <i class="fas fa-shield-alt" aria-hidden="true"></i>
      </div>
      <h1 class="auth-title">Welcome Back</h1>
      <p class="auth-subtitle">Sign in to access your secure account</p>
    </div>
    
    <!-- Security Notice -->
    <div class="security-notice">
      <i class="fas fa-info-circle" aria-hidden="true"></i>
      <span>Your connection is secured with end-to-end encryption</span>
    </div>
  
    <!-- Login Form -->
    <LoginForm 
      on:submit={handleLogin} 
      isLoading={$isLoading}
      {error}
    />
    
    <!-- Footer Actions -->
    <div class="auth-footer">
      <div class="auth-links">
        <p class="auth-link-text">
          Don't have an account? 
          <a href="/register" class="auth-link auth-link-primary">
            Create one
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </p>
        <p class="auth-link-text">
          Forgot your password? 
          <a href="/reset" class="auth-link">Reset it</a>
        </p>
      </div>
      
      <!-- Trust Indicators -->
      <div class="trust-indicators">
        <div class="trust-item">
          <i class="fas fa-lock" aria-hidden="true"></i>
          <span>256-bit SSL</span>
        </div>
        <div class="trust-item">
          <i class="fas fa-shield-check" aria-hidden="true"></i>
          <span>2FA Protected</span>
        </div>
        <div class="trust-item">
          <i class="fas fa-user-shield" aria-hidden="true"></i>
          <span>SOC 2 Compliant</span>
        </div>
      </div>
    </div>
  </div>
</div>

