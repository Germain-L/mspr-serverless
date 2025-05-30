<script lang="ts">
  export let type: 'text' | 'password' | 'email' = 'text';
  export let label: string;
  export let value: string = '';
  export let error: string = '';
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let icon: string = '';
  export let autocomplete: string | undefined = undefined;
  export let id: string = '';
  
  let focused = false;
  let showPassword = false;
  let inputElement: HTMLInputElement;
  
  $: actualType = type === 'password' && showPassword ? 'text' : type;
  
  function togglePassword() {
    showPassword = !showPassword;
    // Keep focus on input after toggling
    setTimeout(() => inputElement?.focus(), 0);
  }
  
  function handleFocus() {
    focused = true;
  }
  
  function handleBlur() {
    focused = false;
  }
</script>

<div class="form-group">
  <label for={id} class="form-label" class:error={error}>
    {label}
    {#if required}<span class="text-red-500 ml-1">*</span>{/if}
  </label>
  
  <div class="input-wrapper" class:focused class:error={error}>
    {#if icon}
      <div class="input-icon">
        <i class={icon} aria-hidden="true"></i>
      </div>
    {/if}
    
    <input
      bind:this={inputElement}
      {id}
      type={actualType}
      {placeholder}
      {disabled}
      {required}
      {autocomplete}
      bind:value
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:input
      class="form-input"
      class:with-icon={icon}
      class:with-action={type === 'password'}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    
    {#if type === 'password'}
      <button
        type="button"
        class="input-action"
        on:click={togglePassword}
        tabindex="-1"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <i class={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true"></i>
      </button>
    {/if}
  </div>
  
  {#if error}
    <div id="{id}-error" class="form-error" role="alert">
      <i class="fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
      {error}
    </div>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--slate-700);
    margin-bottom: 0.5rem;
    transition: color 0.2s ease;
  }
  
  .form-label.error {
    color: var(--error-color);
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid var(--slate-300);
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
    background-color: white;
  }
  
  .input-wrapper:hover:not(.error) {
    border-color: var(--slate-400);
  }
  
  .input-wrapper.focused {
    border-color: var(--primary-500);
    box-shadow: 0 0 0 4px rgb(59 130 246 / 0.1);
  }
  
  .input-wrapper.error {
    border-color: var(--error-color);
    box-shadow: 0 0 0 4px rgb(239 68 68 / 0.1);
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    color: var(--slate-900);
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: var(--radius-lg);
  }
  
  .form-input::placeholder {
    color: var(--slate-400);
  }
  
  .form-input:disabled {
    background-color: var(--slate-50);
    color: var(--slate-500);
    cursor: not-allowed;
  }
  
  .form-input.with-icon {
    padding-left: 3rem;
  }
  
  .form-input.with-action {
    padding-right: 3rem;
  }
  
  .input-icon {
    position: absolute;
    left: 1rem;
    color: var(--slate-400);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
  }
  
  .input-action {
    position: absolute;
    right: 1rem;
    color: var(--slate-400);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease;
    padding: 0.25rem;
    border-radius: var(--radius-base);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  
  .input-action:hover {
    color: var(--slate-600);
    background-color: var(--slate-100);
  }
  
  .input-action:focus {
    outline: none;
    color: var(--primary-600);
    background-color: var(--primary-50);
  }
  
  .form-error {
    display: flex;
    align-items: center;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--error-color);
  }
</style>
