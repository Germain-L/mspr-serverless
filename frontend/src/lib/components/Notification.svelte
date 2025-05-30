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
          bgColor: 'bg-green-500',
          textColor: 'text-white' 
        };
      case 'error':
        return { 
          icon: '✕', 
          bgColor: 'bg-red-500',
          textColor: 'text-white' 
        };
      case 'warning':
        return { 
          icon: '⚠', 
          bgColor: 'bg-yellow-500',
          textColor: 'text-slate-800' 
        };
      case 'info':
      default:
        return { 
          icon: 'ℹ', 
          bgColor: 'bg-blue-500',
          textColor: 'text-white' 
        };
    }
  }
  
  const { icon, bgColor, textColor } = getIconAndColor();
</script>

{#if visible}
  <div 
    class={`fixed top-4 right-4 p-4 rounded shadow-md z-50 flex items-center justify-between max-w-md animate-slide-in ${bgColor} ${textColor}`} 
    role="alert"
  >
    <div class="flex items-center">
      <span class="text-xl mr-3">{icon}</span>
      <span class="text-sm">{message}</span>
    </div>
    
    {#if dismissible}
      <button 
        type="button" 
        class="bg-transparent border-none text-current text-2xl ml-4 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" 
        on:click={dismiss} 
        aria-label="Close"
      >
        ×
      </button>
    {/if}
  </div>
{/if}

<style>
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
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
</style>
