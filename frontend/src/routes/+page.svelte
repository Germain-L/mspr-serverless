<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
</script>

<svelte:head>
  <title>COFRAP - Secure Authentication Made Simple</title>
</svelte:head>

<!-- Hero Section -->
<div class="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
  <!-- Hero Content -->
  <div class="relative max-w-7xl mx-auto px-4 py-20 w-full">
    <div class="text-center">
      <!-- Security Badge -->
      <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 shadow-sm">
        <i class="fas fa-shield-alt mr-2"></i>
        Enterprise-grade security
      </div>
      
      <!-- Main Heading -->
      <h1 class="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
        Secure Authentication
        <span class="gradient-text block">
          Made Simple
        </span>
      </h1>
      
      <!-- Subtitle -->
      <p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        Advanced user management with automatic password generation, 
        mandatory 2FA, and credential rotation for maximum security.
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        {#if $isAuthenticated}
          <a href="/dashboard" class="btn-primary-large">
            <i class="fas fa-tachometer-alt mr-2"></i>
            Go to Dashboard
          </a>
        {:else}
          <a href="/register" class="btn-primary-large">
            Get Started Free
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
          <a href="/login" class="btn-secondary-large">
            <i class="fas fa-sign-in-alt mr-2"></i>
            Sign In
          </a>
        {/if}
      </div>
      
      <!-- Trust Indicators -->
      <div class="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500 mb-16">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 mr-2"></i>
          24-character passwords
        </div>
        <div class="flex items-center">
          <i class="fas fa-mobile-alt text-blue-500 mr-2"></i>
          Mandatory 2FA
        </div>
        <div class="flex items-center">
          <i class="fas fa-sync-alt text-purple-500 mr-2"></i>
          Auto rotation
        </div>
      </div>
    </div>
  </div>
  
  <!-- Decorative Background Elements -->
  <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
  <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-10 blur-3xl"></div>
</div>

<!-- Features Section -->
<div class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Section Header -->
    <div class="text-center mb-16">
      <h2 class="section-title">
        Why Choose COFRAP?
      </h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto">
        Built for enterprises that demand the highest level of security without compromising user experience.
      </p>
    </div>
    
    <!-- Feature Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Secure Password Generation -->
      <div class="card p-8 text-center group">
        <div class="card-icon mx-auto bg-gradient-to-br from-blue-500 to-blue-600">
          <i class="fas fa-key text-white"></i>
        </div>
        <h3 class="text-2xl font-semibold mb-4 text-slate-800">Secure Password Generation</h3>
        <p class="text-slate-600 mb-6">
          Automatically generate secure 24-character passwords with special characters, numbers, and mixed case for maximum protection.
        </p>
        <div class="flex items-center justify-center text-sm text-slate-500">
          <i class="fas fa-shield-alt text-green-500 mr-2"></i>
          Bank-level encryption
        </div>
      </div>
      
      <!-- Two-Factor Authentication -->
      <div class="card p-8 text-center group">
        <div class="card-icon mx-auto bg-gradient-to-br from-green-500 to-green-600">
          <i class="fas fa-mobile-alt text-white"></i>
        </div>
        <h3 class="text-2xl font-semibold mb-4 text-slate-800">Two-Factor Authentication</h3>
        <p class="text-slate-600 mb-6">
          Enhanced security with mandatory two-factor authentication using TOTP (Time-based One-Time Password) for all accounts.
        </p>
        <div class="flex items-center justify-center text-sm text-slate-500">
          <i class="fas fa-clock text-blue-500 mr-2"></i>
          TOTP compatible
        </div>
      </div>
      
      <!-- Credential Rotation -->
      <div class="card p-8 text-center group">
        <div class="card-icon mx-auto bg-gradient-to-br from-purple-500 to-purple-600">
          <i class="fas fa-sync-alt text-white"></i>
        </div>
        <h3 class="text-2xl font-semibold mb-4 text-slate-800">Automatic Rotation</h3>
        <p class="text-slate-600 mb-6">
          Automatic credential rotation every six months ensures your security posture remains strong over time.
        </p>
        <div class="flex items-center justify-center text-sm text-slate-500">
          <i class="fas fa-calendar-alt text-purple-500 mr-2"></i>
          Every 6 months
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Security Stats Section -->
<div class="py-20 bg-slate-50">
  <div class="max-w-7xl mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="section-title">
        Enterprise-Ready Security
      </h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
        <div class="text-slate-600">Uptime Guarantee</div>
      </div>
      <div class="text-center">
        <div class="text-4xl font-bold text-green-600 mb-2">256-bit</div>
        <div class="text-slate-600">AES Encryption</div>
      </div>
      <div class="text-center">
        <div class="text-4xl font-bold text-purple-600 mb-2">24/7</div>
        <div class="text-slate-600">Security Monitoring</div>
      </div>
      <div class="text-center">
        <div class="text-4xl font-bold text-orange-600 mb-2">ISO</div>
        <div class="text-slate-600">27001 Compliant</div>
      </div>
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-4xl font-bold text-white mb-6">
      Ready to Secure Your Organization?
    </h2>
    <p class="text-xl text-blue-100 mb-8">
      Join thousands of organizations that trust COFRAP for their authentication needs.
    </p>
    {#if !$isAuthenticated}
      <a href="/register" class="btn-primary-large bg-white text-blue-600 hover:bg-blue-50">
        Start Your Free Trial
        <i class="fas fa-arrow-right ml-2"></i>
      </a>
    {/if}
  </div>
</div>



