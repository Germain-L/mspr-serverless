<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { logout } from '$lib/stores/auth';
  
  onMount(() => {
    // Log the user out
    logout();
    
    // Redirect to home page
    goto('/');
  });
</script>

<div class="logout-message">
  <p>Logging you out...</p>
</div>

<style>
  .logout-message {
    text-align: center;
    padding: 2rem;
  }
</style>
