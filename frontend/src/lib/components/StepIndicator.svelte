<script lang="ts">
  export let steps: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: string;
  }>;
  export let currentStep: string;
  
  function getStepStatus(stepId: string): 'completed' | 'current' | 'upcoming' {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  }
</script>

<nav class="step-indicator" aria-label="Progress">
  <ol class="step-list">
    {#each steps as step, index}
      {@const status = getStepStatus(step.id)}
      <li class="step-item" class:completed={status === 'completed'} class:current={status === 'current'} class:upcoming={status === 'upcoming'}>
        <div class="step-content">
          <!-- Step Marker -->
          <div class="step-marker" aria-current={status === 'current' ? 'step' : undefined}>
            {#if status === 'completed'}
              <svg class="step-check" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            {:else if step.icon}
              <i class={step.icon} aria-hidden="true"></i>
            {:else}
              <span class="step-number">{index + 1}</span>
            {/if}
          </div>
          
          <!-- Step Text -->
          <div class="step-text">
            <p class="step-title">{step.title}</p>
            {#if step.description}
              <p class="step-description">{step.description}</p>
            {/if}
          </div>
        </div>
        
        <!-- Separator Line -->
        {#if index < steps.length - 1}
          <div class="step-separator" class:completed={getStepStatus(steps[index + 1].id) !== 'upcoming'}></div>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .step-indicator {
    width: 100%;
    padding: 1rem 0;
  }
  
  .step-list {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .step-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 0;
  }
  
  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 1;
  }
  
  .step-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 2px solid var(--slate-300);
    background: white;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .step-item.upcoming .step-marker {
    border-color: var(--slate-300);
    color: var(--slate-400);
    background: white;
  }
  
  .step-item.current .step-marker {
    border-color: var(--primary-600);
    background: var(--primary-600);
    color: white;
    box-shadow: 0 0 0 4px rgb(59 130 246 / 0.1);
  }
  
  .step-item.completed .step-marker {
    border-color: var(--security-green);
    background: var(--security-green);
    color: white;
  }
  
  .step-number {
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .step-check {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .step-text {
    max-width: 8rem;
  }
  
  .step-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: var(--slate-900);
    transition: color 0.3s ease;
  }
  
  .step-item.upcoming .step-title {
    color: var(--slate-500);
  }
  
  .step-item.current .step-title {
    color: var(--primary-600);
  }
  
  .step-item.completed .step-title {
    color: var(--security-green);
  }
  
  .step-description {
    font-size: 0.75rem;
    color: var(--slate-500);
    margin: 0;
    line-height: 1.3;
  }
  
  .step-item.upcoming .step-description {
    color: var(--slate-400);
  }
  
  .step-separator {
    position: absolute;
    top: 1.25rem;
    left: 50%;
    right: -50%;
    height: 2px;
    background: var(--slate-300);
    transition: background-color 0.3s ease;
    z-index: 0;
  }
  
  .step-separator.completed {
    background: var(--security-green);
  }
  
  /* Mobile responsive */
  @media (max-width: 640px) {
    .step-list {
      flex-direction: column;
      align-items: stretch;
    }
    
    .step-item {
      flex-direction: row;
      align-items: center;
      text-align: left;
      margin-bottom: 1.5rem;
    }
    
    .step-item:last-child {
      margin-bottom: 0;
    }
    
    .step-content {
      flex-direction: row;
      align-items: center;
      text-align: left;
      gap: 1rem;
    }
    
    .step-marker {
      margin-bottom: 0;
      flex-shrink: 0;
    }
    
    .step-text {
      max-width: none;
      flex: 1;
    }
    
    .step-separator {
      top: auto;
      bottom: -0.75rem;
      left: 1.25rem;
      right: auto;
      width: 2px;
      height: 1.5rem;
    }
    
    .step-item:last-child .step-separator {
      display: none;
    }
  }
  
  /* Enhanced accessibility */
  @media (prefers-reduced-motion: reduce) {
    .step-marker,
    .step-title,
    .step-separator {
      transition: none;
    }
  }
</style>
