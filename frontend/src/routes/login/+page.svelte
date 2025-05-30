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

<div class="max-w-lg mx-auto px-4 py-8">
  <h1 class="text-center text-3xl font-semibold mb-8 text-slate-800">Login to Your Account</h1>
  
  {#if error}
    <div class="bg-red-100 text-red-800 p-3 mb-4 rounded border border-red-200">
      {error}
    </div>
  {/if}
  
  <LoginForm 
    on:submit={handleLogin} 
    isLoading={$isLoading} 
  />
  
  <div class="mt-6 text-center">
    <p>Don't have an account? <a href="/register" class="text-blue-500 hover:underline">Create one</a></p>
  </div>
</div>

