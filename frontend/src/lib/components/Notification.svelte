<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let message: string;
  export let duration = 5000; // Default duration in milliseconds
  export let dismissible = true;
  
  const dispatch = createEventDispatcher<{
    dismiss: void;
  }>();
  
  let visible = true;
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  function dismiss() {
    visible = false;
    dispatch('dismiss');
  }
  
  onMount(() => {
    if (duration > 0) {
      timer = setTimeout(() => {
        dismiss();
      }, duration);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  });
  
  function getIconAndColor() {
    switch (type) {
      case 'success':
        return { 
          icon: '✓', 
          bgColor: 'bg-success',
          textColor: 'text-white' 
        };
      case 'error':
        return { 
          icon: '✕', 
          bgColor: 'bg-error',
          textColor: 'text-white' 
        };
      case 'warning':
        return { 
          icon: '⚠', 
          bgColor: 'bg-warning',
          textColor: 'text-secondary-color' 
        };
      case 'info':
      default:
        return { 
          icon: 'ℹ', 
          bgColor: 'bg-primary',
          textColor: 'text-white' 
        };
    }
  }
  
  const { icon, bgColor, textColor } = getIconAndColor();
</script>

{#if visible}
  <div class={`notification ${bgColor} ${textColor}`} role="alert">
    <div class="notification-content">
      <span class="notification-icon">{icon}</span>
      <span class="notification-message">{message}</span>
    </div>
    
    {#if dismissible}
      <button type="button" class="notification-close" on:click={dismiss} aria-label="Close">
        ×
      </button>
    {/if}
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 1rem;
    border-radius: 0.25rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 25rem;
    animation: slide-in 0.3s ease-out;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
  }
  
  .notification-icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
  }
  
  .notification-message {
    font-size: 0.875rem;
  }
  
  .notification-close {
    background: transparent;
    border: none;
    color: inherit;
    font-size: 1.5rem;
    margin-left: 1rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .notification-close:hover {
    opacity: 1;
  }
  
  .bg-success {
    background-color: var(--success-color);
  }
  
  .bg-error {
    background-color: var(--error-color);
  }
  
  .bg-warning {
    background-color: var(--warning-color);
  }
  
  .bg-primary {
    background-color: var(--primary-color);
  }
  
  .text-white {
    color: white;
  }
  
  .text-secondary-color {
    color: var(--secondary-color);
  }
  
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
