<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  $: error = $page.error;
  $: status = $page.status;
  
  function goHome() {
    goto('/');
  }
  
  function goBack() {
    history.back();
  }
</script>

<svelte:head>
  <title>Error {status} - COFRAP User Management</title>
</svelte:head>

<div class="error-page">
  <div class="error-container">
    <div class="error-content">
      <!-- Error Icon -->
      <div class="error-icon">
        {#if status === 404}
          <i class="fas fa-search" aria-hidden="true"></i>
        {:else if status === 403}
          <i class="fas fa-shield-alt" aria-hidden="true"></i>
        {:else if status === 500}
          <i class="fas fa-server" aria-hidden="true"></i>
        {:else}
          <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        {/if}
      </div>
      
      <!-- Error Message -->
      <div class="error-message">
        <h1 class="error-title">
          {#if status === 404}
            Page Not Found
          {:else if status === 403}
            Access Denied
          {:else if status === 500}
            Server Error
          {:else}
            Oops! Something went wrong
          {/if}
        </h1>
        
        <p class="error-description">
          {#if status === 404}
            The page you're looking for doesn't exist or has been moved.
          {:else if status === 403}
            You don't have permission to access this resource.
          {:else if status === 500}
            We're experiencing technical difficulties. Please try again later.
          {:else}
            An unexpected error occurred. Please try again.
          {/if}
        </p>
        
        {#if error?.message}
          <div class="error-details">
            <details>
              <summary>Technical Details</summary>
              <code>{error.message}</code>
            </details>
          </div>
        {/if}
      </div>
      
      <!-- Error Actions -->
      <div class="error-actions">
        <button class="btn btn-primary btn-lg" onclick={goHome}>
          <i class="fas fa-home" aria-hidden="true"></i>
          Go Home
        </button>
        <button class="btn btn-secondary btn-lg" onclick={goBack}>
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
          Go Back
        </button>
      </div>
      
      <!-- Help Section -->
      <div class="error-help">
        <h3 class="help-title">Need Help?</h3>
        <div class="help-options">
          <a href="/support" class="help-link">
            <i class="fas fa-life-ring" aria-hidden="true"></i>
            Contact Support
          </a>
          <a href="/docs" class="help-link">
            <i class="fas fa-book" aria-hidden="true"></i>
            Documentation
          </a>
          <a href="mailto:support@cofrap.com" class="help-link">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            Email Us
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .error-page {
    min-height: calc(100vh - 4rem - 5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--error-50) 100%);
  }
  
  .error-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .error-content {
    background: var(--surface-color);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-color);
    padding: 3rem 2rem;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    .error-content {
      padding: 2rem 1.5rem;
    }
  }
  
  .error-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 5rem;
    height: 5rem;
    background: linear-gradient(135deg, var(--error-500) 0%, var(--error-600) 100%);
    border-radius: 50%;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-lg);
  }
  
  .error-icon i {
    font-size: 2rem;
    color: white;
  }
  
  .error-message {
    margin-bottom: 2rem;
  }
  
  .error-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
    letter-spacing: -0.025em;
  }
  
  .error-description {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }
  
  .error-details {
    margin-top: 1.5rem;
    text-align: left;
  }
  
  .error-details details {
    background: var(--surface-muted);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 1rem;
  }
  
  .error-details summary {
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    margin-bottom: 0.5rem;
  }
  
  .error-details code {
    display: block;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: var(--error-600);
    word-break: break-word;
    line-height: 1.5;
  }
  
  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
  }
  
  .btn:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .btn-primary {
    background: var(--gradient-primary);
    color: white;
  }
  
  .btn-primary:hover {
    background: var(--gradient-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  .btn-secondary {
    background: var(--surface-muted);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  
  .btn-secondary:hover {
    background: var(--surface-color);
    border-color: var(--primary-300);
    transform: translateY(-1px);
  }
  
  .btn-lg {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
  
  .error-help {
    border-top: 1px solid var(--border-color);
    padding-top: 2rem;
  }
  
  .help-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
  }
  
  .help-options {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .help-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary-600);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  
  .help-link:hover {
    color: var(--primary-700);
    text-decoration: underline;
  }
  
  .help-link i {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    .error-title {
      font-size: 1.5rem;
    }
    
    .error-description {
      font-size: 1rem;
    }
    
    .error-actions {
      flex-direction: column;
    }
    
    .help-options {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
