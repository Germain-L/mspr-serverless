<script lang="ts">
  import { goto } from '$app/navigation';
  import { isLoading } from '$lib/stores/auth';
  import { passwordService, twoFactorService } from '$lib/services/api';
  import { notifications } from '$lib/stores/notification';
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  import QRCodeDisplay from '$lib/components/QRCodeDisplay.svelte';
  import StepIndicator from '$lib/components/StepIndicator.svelte';
  
  let step: 'form' | 'password' | 'twoFactor' = 'form';
  let error: string | null = null;
  let username = '';
  let passwordData: { qr_code: string; password: string } | null = null;
  let tfaData: { qr_code: string } | null = null;
  
  const steps = [
    { id: 'form', title: 'Account Details', icon: 'fas fa-user' },
    { id: 'password', title: 'Secure Password', icon: 'fas fa-key' },
    { id: 'twoFactor', title: 'Two-Factor Auth', icon: 'fas fa-shield-alt' }
  ];
  
  $: currentStepId = steps[steps.findIndex(s => s.id === step)]?.id || 'form';
  
  async function handleRegistration({ detail }: CustomEvent<{ username: string }>) {
    error = null;
    isLoading.set(true);
    username = detail.username;
    
    try {
      // Generate password
      passwordData = await passwordService.generate(username);
      step = 'password';
      
      notifications.add(
        'Account created! Please save your secure password.',
        'success',
        5000
      );
      
      // Pre-fetch 2FA data
      tfaData = await twoFactorService.generate(username);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred during registration';
      notifications.add(
        error,
        'error',
        5000
      );
    } finally {
      isLoading.set(false);
    }
  }
  
  function proceedToTwoFactor() {
    if (tfaData) {
      step = 'twoFactor';
      notifications.add(
        'Please set up two-factor authentication to secure your account.',
        'info',
        4000
      );
    }
  }
  
  function proceedToLogin() {
    notifications.add(
      'Account setup complete! You can now log in.',
      'success',
      4000
    );
    goto('/login');
  }
</script>

<svelte:head>
  <title>Register - COFRAP User Management</title>
  <meta name="description" content="Create a secure COFRAP account with two-factor authentication">
</svelte:head>

<div class="auth-page">
  <div class="auth-container">
    <!-- Header Section -->
    <div class="auth-header">
      <div class="auth-icon">
        <i class="fas fa-user-plus" aria-hidden="true"></i>
      </div>
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Join COFRAP with enterprise-grade security</p>
    </div>
    
    <!-- Step Indicator -->
    <div class="step-indicator-container">
      <StepIndicator 
        {steps}
        currentStep={currentStepId}
      />
    </div>
    
    <!-- Step Content -->
    {#if step === 'form'}
      <!-- Registration Form Step -->
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-user" aria-hidden="true"></i>
            Account Details
          </h2>
          <p class="step-description">
            Create your secure account username. We'll generate a strong password for you.
          </p>
        </div>
        
        <RegistrationForm 
          on:submit={handleRegistration}
          isLoading={$isLoading}
        />
        
        <div class="auth-footer">
          <div class="auth-links">
            <p class="auth-link-text">
              Already have an account? 
              <a href="/login" class="auth-link">
                Sign in here
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </a>
            </p>
          </div>
        </div>
      </div>
      
    {:else if step === 'password' && passwordData}
      <!-- Password Generation Step -->
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-key" aria-hidden="true"></i>
            Secure Password Generated
          </h2>
          <p class="step-description">
            Your cryptographically secure password has been generated. Save it now - it won't be shown again.
          </p>
        </div>
        
        <!-- Security Alert -->
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
          <div>
            <strong>Important:</strong> This password will only be displayed once for security reasons. 
            Please save it in a secure password manager immediately.
          </div>
        </div>
        
        <!-- Password Display -->
        <div class="password-display">
          <div class="password-info">
            <h3 class="password-label">Your Generated Password</h3>
            <div class="password-value">
              <code class="password-code">{passwordData.password}</code>
              <button 
                class="copy-button"
                onclick={() => passwordData && navigator.clipboard.writeText(passwordData.password)}
                title="Copy password"
                aria-label="Copy password to clipboard"
              >
                <i class="fas fa-copy" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        
        <QRCodeDisplay 
          qrCodeData={passwordData.qr_code}
          title="Password QR Code"
          instructions="Scan this QR code to save your password securely"
        />
        
        <div class="step-actions">
          <button 
            class="btn btn-security btn-lg btn-full"
            onclick={proceedToTwoFactor}
          >
            <i class="fas fa-check" aria-hidden="true"></i>
            I've Saved My Password - Continue
          </button>
        </div>
        
        <!-- Security Tips -->
        <div class="security-tips">
          <h4 class="tips-title">
            <i class="fas fa-lightbulb" aria-hidden="true"></i>
            Security Tips
          </h4>
          <ul class="tips-list">
            <li>Use a password manager like 1Password, Bitwarden, or LastPass</li>
            <li>Never share your password with anyone</li>
            <li>Store the QR code in a secure location</li>
          </ul>
        </div>
      </div>
      
    {:else if step === 'twoFactor' && tfaData}
      <!-- Two-Factor Authentication Step -->
      <div class="step-content">
        <div class="step-header">
          <h2 class="step-title">
            <i class="fas fa-shield-alt" aria-hidden="true"></i>
            Two-Factor Authentication
          </h2>
          <p class="step-description">
            Set up 2FA for an additional layer of security. You'll need this for every login.
          </p>
        </div>
        
        <!-- 2FA Instructions -->
        <div class="tfa-instructions">
          <h3 class="instructions-title">Setup Instructions</h3>
          <ol class="instructions-list">
            <li>Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
            <li>Open the app and tap "Add Account" or "+"</li>
            <li>Scan the QR code below with your phone's camera</li>
            <li>Your account will be added and start generating 6-digit codes</li>
          </ol>
        </div>
        
        <QRCodeDisplay 
          qrCodeData={tfaData.qr_code}
          title="Two-Factor Authentication"
          instructions="Scan with your authenticator app to complete setup"
        />
        
        <div class="step-actions">
          <button 
            class="btn btn-security btn-lg btn-full"
            onclick={proceedToLogin}
          >
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Setup Complete - Sign In
          </button>
        </div>
        
        <!-- App Recommendations -->
        <div class="app-recommendations">
          <h4 class="recommendations-title">
            <i class="fas fa-mobile-alt" aria-hidden="true"></i>
            Recommended Apps
          </h4>
          <div class="app-grid">
            <div class="app-item">
              <i class="fab fa-google" aria-hidden="true"></i>
              <span>Google Authenticator</span>
            </div>
            <div class="app-item">
              <i class="fas fa-shield-halved" aria-hidden="true"></i>
              <span>Authy</span>
            </div>
            <div class="app-item">
              <i class="fab fa-microsoft" aria-hidden="true"></i>
              <span>Microsoft Authenticator</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
