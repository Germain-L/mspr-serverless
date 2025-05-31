<script lang="ts">
  interface Props {
    id?: string;
    name?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    placeholder?: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: string | null;
    class?: string;
    label?: string;
    error?: string;
    onchange?: (event: Event) => void;
    oninput?: (event: Event) => void;
    onblur?: (event: Event) => void;
  }

  let {
    id,
    name,
    type = 'text',
    placeholder = '',
    value = $bindable(''),
    required = false,
    disabled = false,
    autocomplete,
    class: className = '',
    label,
    error,
    onchange,
    oninput,
    onblur
  }: Props = $props();

  const baseClasses = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-cofrap-500 focus:outline-none focus:ring-1 focus:ring-cofrap-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
  
  const inputClasses = error ? `${baseClasses} ${errorClasses} ${className}` : `${baseClasses} ${className}`;
</script>

<div class="space-y-1">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <input
    {id}
    {name}
    {type}
    {placeholder}
    {required}
    {disabled}
    autocomplete={autocomplete as any}
    class={inputClasses}
    bind:value
    onchange={onchange}
    oninput={oninput}
    onblur={onblur}
  />
  
  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>
