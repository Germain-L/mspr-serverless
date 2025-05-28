<script lang="ts">
  export let qrCodeData: string;
  export let title: string;
  export let instructions: string;
</script>

<div class="qr-container">
  <h2>{title}</h2>
  <div class="qr-image">
    <img src="data:image/png;base64,{qrCodeData}" alt="QR Code" />
  </div>
  <p class="instructions">{instructions}</p>
</div>

<style>
  .qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 1rem 0;
    max-width: 320px;
    margin: 0 auto;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .qr-image {
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .qr-image img {
    display: block;
    width: 200px;
    height: 200px;
  }

  .instructions {
    font-size: 0.875rem;
    text-align: center;
    color: #4a5568;
    margin-top: 0.75rem;
  }
</style>
