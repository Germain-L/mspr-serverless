<script lang="ts">
  export let loading: boolean = false;
  export let variant: 'primary' | 'secondary' | 'security' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' = 'button';
  export let fullWidth: boolean = false;
  export let loadingText: string = 'Processing...';
  
  $: isDisabled = disabled || loading;
  $: buttonClasses = `loading-button ${variant} ${size} ${fullWidth ? 'full-width' : ''}`;
</script>

<button
  {type}
  class={buttonClasses}
  class:loading
  disabled={isDisabled}
  on:click
>
  <span class="button-content" class:hidden={loading}>
    <slot />
  </span>
  
  {#if loading}
    <div class="loading-spinner">
      <div class="spinner"></div>
      <span class="loading-text">{loadingText}</span>
    </div>
  {/if}
</button>

<style>
  .loading-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid transparent;
    text-decoration: none;
    text-align: center;
    overflow: hidden;
  }
  
  .loading-button:focus {
    outline: none;
    box-shadow: var(--shadow-focus);
  }
  
  .loading-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  .loading-button.loading {
    cursor: wait;
  }
  
  /* Variants */
  .loading-button.primary {
    background-color: var(--primary-600);
    color: white;
    box-shadow: var(--shadow-sm);
  }
  
  .loading-button.primary:hover:not(:disabled):not(.loading) {
    background-color: var(--primary-700);
    box-shadow: var(--shadow-card);
    transform: translateY(-1px);
  }
  
  .loading-button.secondary {
    background-color: white;
    color: var(--slate-700);
    border-color: var(--slate-300);
    box-shadow: var(--shadow-sm);
  }
  
  .loading-button.secondary:hover:not(:disabled):not(.loading) {
    background-color: var(--slate-50);
    border-color: var(--slate-400);
    box-shadow: var(--shadow-card);
    transform: translateY(-1px);
  }
  
  .loading-button.security {
    background: var(--gradient-security);
    color: white;
    border: none;
    box-shadow: var(--shadow-card);
  }
  
  .loading-button.security:hover:not(:disabled):not(.loading) {
    box-shadow: var(--shadow-modal);
    transform: translateY(-2px);
  }
  
  /* Sizes */
  .loading-button.sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .loading-button.md {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
  
  .loading-button.lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
  
  .loading-button.full-width {
    width: 100%;
  }
  
  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;
  }
  
  .button-content.hidden {
    opacity: 0;
  }
  
  .loading-spinner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    opacity: 0.8;
  }
  
  .loading-text {
    font-size: 0.875rem;
    opacity: 0.9;
  }
  
  .loading-button.sm .spinner {
    width: 1rem;
    height: 1rem;
    border-width: 1.5px;
  }
  
  .loading-button.lg .spinner {
    width: 1.5rem;
    height: 1.5rem;
    border-width: 2.5px;
  }
  
  @keyframes spin {
    to { 
      transform: rotate(360deg); 
    }
  }
</style>
