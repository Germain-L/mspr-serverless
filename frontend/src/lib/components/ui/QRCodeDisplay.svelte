<script lang="ts">
  interface Props {
    qrCodeBase64: string;
    title?: string;
    description?: string;
    class?: string;
  }

  let {
    qrCodeBase64,
    title = 'QR Code',
    description = '',
    class: className = ''
  }: Props = $props();
</script>

<div class="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto {className}">
  <h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
  
  {#if description}
    <p class="text-gray-600 mb-4 text-sm">{description}</p>
  {/if}
  
  <div class="flex justify-center">
    <div class="bg-white p-4 rounded-lg border-2 border-gray-200">
      <img 
        src="data:image/png;base64,{qrCodeBase64}" 
        alt="QR Code" 
        class="block max-w-full h-auto"
      />
    </div>
  </div>
</div>
