<script lang="ts">
  export let qrCodeData: string;
  export let title: string;
  export let instructions: string;
</script>

<div class="flex flex-col items-center p-6 bg-white rounded-lg shadow-md my-4 mx-auto max-w-xs">
  <h2 class="text-2xl mb-4 text-gray-800">{title}</h2>
  <div class="p-3 bg-white border border-gray-200 rounded mb-4">
    <img src="data:image/png;base64,{qrCodeData}" alt="QR Code" class="block w-[200px] h-[200px]" />
  </div>
  <p class="text-sm text-center text-gray-600 mt-3">{instructions}</p>
</div>
