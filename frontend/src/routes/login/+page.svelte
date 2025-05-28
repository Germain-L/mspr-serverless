<script lang="ts">
  import { goto } from '$app/navigation';
  import { isLoading, setError, login } from '$lib/stores/auth';
  import { authService } from '$lib/services/api';
  import LoginForm from '$lib/components/LoginForm.svelte';
  
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
        goto('/reset?username=' + encodeURIComponent(detail.username));
      } else {
        // Login successful, update auth store and navigate to dashboard
        login({
          id: response.user_id,
          username: response.username
        });
        
        goto('/dashboard');
      }
    } catch (err) {
      // Handle login error
      error = err instanceof Error ? err.message : 'An error occurred during login';
      setError(error);
    } finally {
      isLoading.set(false);
    }
  }
</script>

<div class="login-container">
  <h1>Login to Your Account</h1>
  
  {#if error}
    <div class="error-alert">
      {error}
    </div>
  {/if}
  
  <LoginForm 
    on:submit={handleLogin} 
    isLoading={$isLoading} 
  />
  
  <div class="auth-links">
    <p>Don't have an account? <a href="/register">Create one</a></p>
  </div>
</div>

<style>
  .login-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
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
</style>
