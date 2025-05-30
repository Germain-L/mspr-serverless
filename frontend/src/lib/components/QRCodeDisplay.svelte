<script lang="ts">
  export let qrCodeData: string;
  export let title: string;
  export let instructions: string;
  export let copyText: string = '';
  export let secretKey: string = '';
  
  let copied = false;
  let showModal = false;
  let showSecret = false;
  
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
  
  function openModal() {
    showModal = true;
  }
  
  function closeModal() {
    showModal = false;
  }
  
  function toggleSecret() {
    showSecret = !showSecret;
  }
</script>

<div class="qr-display card p-8 max-w-md mx-auto">
  <!-- Header -->
  <div class="qr-header text-center mb-6">
    <div class="card-icon mx-auto bg-gradient-to-br from-green-500 to-green-600 mb-4">
      <i class="fas fa-qrcode text-white"></i>
    </div>
    <h2 class="qr-title text-2xl font-bold text-slate-900 mb-2">{title}</h2>
    <p class="qr-instructions text-slate-600">{instructions}</p>
  </div>
  
  <!-- QR Code Container -->
  <div class="qr-container mb-6">
    <div class="qr-code-wrapper relative group">
      <div class="qr-frame">
        <img src="data:image/png;base64,{qrCodeData}" alt="QR Code" class="qr-image" />
      </div>
      
      <!-- Hover overlay -->
      <div class="qr-overlay">
        <button class="qr-zoom" on:click={openModal} title="View larger" aria-label="View QR code larger">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Action Buttons -->
  <div class="qr-actions space-y-3">
    {#if copyText}
      <button 
        class="copy-button w-full"
        class:copied
        on:click={() => copyToClipboard(copyText)}
      >
        {#if copied}
          <i class="fas fa-check mr-2 text-green-600"></i>
          Copied!
        {:else}
          <i class="fas fa-copy mr-2"></i>
          Copy Setup Key
        {/if}
      </button>
    {/if}
    
    {#if secretKey}
      <div class="secret-section">
        <button 
          class="secret-toggle w-full"
          on:click={toggleSecret}
        >
          <i class="{showSecret ? 'fas fa-eye-slash' : 'fas fa-eye'} mr-2" aria-hidden="true"></i>
          {showSecret ? 'Hide' : 'Show'} Secret Key
        </button>
        
        {#if showSecret}
          <div class="secret-display">
            <code class="secret-key">{secretKey}</code>
            <button 
              class="secret-copy"
              on:click={() => copyToClipboard(secretKey)}
              title="Copy secret key"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Help Section -->
  <div class="qr-help mt-6">
    <details class="help-details">
      <summary class="help-summary">
        <i class="fas fa-question-circle mr-2"></i>
        Need help scanning?
      </summary>
      <div class="help-content">
        <ol class="help-steps">
          <li>
            <span class="step-number">1</span>
            <span>Open your authenticator app (Google Authenticator, Authy, etc.)</span>
          </li>
          <li>
            <span class="step-number">2</span>
            <span>Tap "Add account" or the "+" button</span>
          </li>
          <li>
            <span class="step-number">3</span>
            <span>Choose "Scan QR code" or "Scan barcode"</span>
          </li>
          <li>
            <span class="step-number">4</span>
            <span>Point your camera at the QR code above</span>
          </li>
        </ol>
        
        <div class="help-note">
          <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
          <span class="text-sm text-slate-600">
            Can't scan? Use the "Show Secret Key" option to manually enter the code.
          </span>
        </div>
      </div>
    </details>
  </div>
</div>

<!-- Modal for enlarged QR code -->
{#if showModal}
  <div class="modal-overlay" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h3 class="modal-title">QR Code</h3>
        <button class="modal-close" on:click={closeModal} aria-label="Close modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <img src="data:image/png;base64,{qrCodeData}" alt="QR Code" class="modal-qr" />
      </div>
    </div>
  </div>
{/if}

<style>
  .qr-display {
    background: white;
  }
  
  .qr-code-wrapper {
    position: relative;
    display: inline-block;
    margin: 0 auto;
  }
  
  .qr-frame {
    padding: 1rem;
    background: white;
    border: 2px solid var(--slate-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
  }
  
  .qr-image {
    display: block;
    width: 200px;
    height: 200px;
    border-radius: var(--radius-base);
  }
  
  .qr-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .qr-code-wrapper:hover .qr-overlay {
    opacity: 1;
  }
  
  .qr-zoom {
    background: white;
    border: none;
    padding: 0.75rem;
    border-radius: var(--radius-base);
    color: var(--slate-700);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-card);
  }
  
  .qr-zoom:hover {
    transform: scale(1.1);
    color: var(--primary-600);
  }
  
  .copy-button, .secret-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    background: var(--slate-100);
    border: 1px solid var(--slate-300);
    border-radius: var(--radius-lg);
    color: var(--slate-700);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .copy-button:hover, .secret-toggle:hover {
    background: var(--slate-200);
    border-color: var(--slate-400);
  }
  
  .copy-button.copied {
    background: var(--security-green-light);
    border-color: var(--security-green);
    color: var(--security-green);
  }
  
  .secret-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-base);
  }
  
  .secret-key {
    flex: 1;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    font-size: 0.75rem;
    color: var(--slate-700);
    word-break: break-all;
    background: transparent;
    border: none;
    outline: none;
  }
  
  .secret-copy {
    background: transparent;
    border: none;
    color: var(--slate-400);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-base);
    transition: color 0.2s ease;
  }
  
  .secret-copy:hover {
    color: var(--slate-600);
  }
  
  .help-details {
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  
  .help-summary {
    padding: 1rem;
    background: var(--slate-50);
    cursor: pointer;
    font-weight: 500;
    color: var(--slate-700);
    display: flex;
    align-items: center;
    transition: background-color 0.2s ease;
  }
  
  .help-summary:hover {
    background: var(--slate-100);
  }
  
  .help-content {
    padding: 1rem;
    background: white;
  }
  
  .help-steps {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  
  .help-steps li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding: 0.5rem 0;
  }
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: var(--primary-600);
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .help-note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--yellow-50, #fefce8);
    border: 1px solid var(--yellow-200, #fde047);
    border-radius: var(--radius-base);
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .modal-content {
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-modal);
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--slate-200);
  }
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--slate-900);
    margin: 0;
  }
  
  .modal-close {
    background: transparent;
    border: none;
    color: var(--slate-400);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--radius-base);
    transition: all 0.2s ease;
  }
  
  .modal-close:hover {
    color: var(--slate-600);
    background: var(--slate-100);
  }
  
  .modal-body {
    padding: 2rem;
    display: flex;
    justify-content: center;
  }
  
  .modal-qr {
    width: 300px;
    height: 300px;
    border-radius: var(--radius-lg);
  }
  
  @media (max-width: 640px) {
    .qr-image {
      width: 160px;
      height: 160px;
    }
    
    .modal-qr {
      width: 250px;
      height: 250px;
    }
    
    .modal-body {
      padding: 1rem;
    }
  }
</style>
