<script lang="ts">
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let title: string;
  export let message: string;
  export let action: { label: string; handler: () => void } | null = null;
  export let persistent: boolean = false;
  export let duration: number = 4000;
  export let onClose: (() => void) | null = null;
  
  let visible = true;
  let progressWidth = 100;
  
  // Auto-hide logic
  if (!persistent) {
    const interval = setInterval(() => {
      progressWidth -= (100 / duration) * 50; // Update every 50ms
      if (progressWidth <= 0) {
        clearInterval(interval);
        hide();
      }
    }, 50);
  }
  
  function hide() {
    visible = false;
    if (onClose) {
      setTimeout(onClose, 300); // Allow for exit animation
    }
  }
  
  function handleAction() {
    if (action) {
      action.handler();
    }
  }
  
  // Icon mapping
  $: icon = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }[type];
</script>

{#if visible}
  <div class="toast toast-{type}" role="alert" aria-live="polite">
    <div class="toast-content">
      <div class="toast-icon">
        <i class={icon} aria-hidden="true"></i>
      </div>
      
      <div class="toast-text">
        <h4 class="toast-title">{title}</h4>
        <p class="toast-message">{message}</p>
      </div>
      
      <div class="toast-actions">
        {#if action}
          <button class="toast-action" on:click={handleAction}>
            {action.label}
          </button>
        {/if}
        
        <button class="toast-close" on:click={hide} aria-label="Close notification">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    
    {#if !persistent}
      <div class="toast-progress" style="width: {progressWidth}%"></div>
    {/if}
  </div>
{/if}

<style>
  .toast {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-modal);
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;
    border-left: 4px solid var(--primary-500);
    animation: toast-enter 0.3s ease-out;
    min-width: 320px;
    max-width: 500px;
  }
  
  .toast-success {
    border-left-color: var(--security-green);
  }
  
  .toast-error {
    border-left-color: var(--error-color);
  }
  
  .toast-warning {
    border-left-color: var(--warning-color);
  }
  
  .toast-info {
    border-left-color: var(--info-color);
  }
  
  .toast-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.5rem;
  }
  
  .toast-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-600);
    margin-top: 0.25rem;
  }
  
  .toast-success .toast-icon {
    color: var(--security-green);
  }
  
  .toast-error .toast-icon {
    color: var(--error-color);
  }
  
  .toast-warning .toast-icon {
    color: var(--warning-color);
  }
  
  .toast-info .toast-icon {
    color: var(--info-color);
  }
  
  .toast-text {
    flex: 1;
    min-width: 0;
  }
  
  .toast-title {
    font-weight: 600;
    color: var(--slate-900);
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25;
  }
  
  .toast-message {
    color: var(--slate-600);
    font-size: 0.875rem;
    line-height: 1.4;
    margin: 0;
  }
  
  .toast-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  
  .toast-action {
    background: transparent;
    border: 1px solid var(--primary-300);
    color: var(--primary-600);
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-base);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .toast-action:hover {
    background: var(--primary-50);
    border-color: var(--primary-400);
  }
  
  .toast-close {
    background: transparent;
    border: none;
    color: var(--slate-400);
    padding: 0.25rem;
    border-radius: var(--radius-base);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .toast-close:hover {
    color: var(--slate-600);
    background: var(--slate-100);
  }
  
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--primary-500);
    transition: width 0.05s linear;
  }
  
  .toast-success .toast-progress {
    background: var(--security-green);
  }
  
  .toast-error .toast-progress {
    background: var(--error-color);
  }
  
  .toast-warning .toast-progress {
    background: var(--warning-color);
  }
  
  .toast-info .toast-progress {
    background: var(--info-color);
  }
  
  @keyframes toast-enter {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 640px) {
    .toast {
      min-width: auto;
      max-width: none;
      margin: 0 1rem 1rem 1rem;
    }
    
    .toast-content {
      padding: 0.875rem 1rem;
    }
    
    .toast-actions {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>
