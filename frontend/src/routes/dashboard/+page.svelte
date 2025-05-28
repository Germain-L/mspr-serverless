<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, isAuthenticated } from '$lib/stores/auth';
  
  onMount(() => {
    // Redirect to login if not authenticated
    if (!$isAuthenticated) {
      goto('/login');
    }
  });
</script>

<div class="dashboard">
  <h1>User Dashboard</h1>
  
  {#if $user}
    <div class="user-info">
      <h2>Welcome, {$user.username}!</h2>
      <p>Your account is active and secure.</p>
    </div>
    
    <div class="account-status">
      <h3>Account Security Status</h3>
      <ul class="security-list">
        <li class="security-item">
          <span class="security-icon">✅</span>
          <div class="security-content">
            <h4>Secure Password</h4>
            <p>Your account is protected with a strong, secure password.</p>
          </div>
        </li>
        <li class="security-item">
          <span class="security-icon">✅</span>
          <div class="security-content">
            <h4>Two-Factor Authentication</h4>
            <p>Your account is protected with two-factor authentication.</p>
          </div>
        </li>
      </ul>
    </div>
    
    <div class="dashboard-actions">
      <h3>Account Actions</h3>
      <a href="/reset" class="btn btn-secondary">Reset Credentials</a>
    </div>
  {:else}
    <p>Loading user information...</p>
  {/if}
</div>

<style>
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    margin-bottom: 2rem;
    color: #2c3e50;
  }
  
  .user-info {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .user-info h2 {
    margin-top: 0;
    color: #2c3e50;
  }
  
  .user-info p {
    margin-bottom: 0;
    color: #6c757d;
  }
  
  .account-status {
    margin-bottom: 2rem;
  }
  
  .account-status h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .security-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .security-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .security-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .security-content h4 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
  }
  
  .security-content p {
    margin: 0;
    color: #6c757d;
  }
  
  .dashboard-actions {
    margin-top: 2rem;
  }
  
  .dashboard-actions h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-weight: 500;
    text-align: center;
    transition: background-color 0.2s;
  }
  
  .btn-secondary {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
  
  .btn-secondary:hover {
    background-color: #bdc3c7;
  }
</style>
