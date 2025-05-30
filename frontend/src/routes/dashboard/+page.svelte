<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import LoadingButton from '$lib/components/LoadingButton.svelte';
  
  let downloadingBackup = false;
  
  onMount(() => {
    // Redirect to login if not authenticated
    if (!$isAuthenticated) {
      goto('/login');
    }
  });
  
  async function downloadBackupCodes() {
    downloadingBackup = true;
    try {
      // Simulate backup code generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create backup codes file
      const backupCodes = [
        '1234-5678-9012',
        '2345-6789-0123',
        '3456-7890-1234',
        '4567-8901-2345',
        '5678-9012-3456'
      ];
      
      const content = `COFRAP Emergency Backup Codes
Generated: ${new Date().toLocaleDateString()}
Username: ${$user?.username}

Keep these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

These codes will allow you to access your account if you lose access to your authenticator device.`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cofrap-backup-codes-${$user?.username}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup codes:', error);
    } finally {
      downloadingBackup = false;
    }
  }
  
  // Mock data for demonstration
  $: securityScore = 100;
  $: lastPasswordUpdate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  $: accountAge = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
</script>

<svelte:head>
  <title>Dashboard - COFRAP</title>
</svelte:head>

<div class="dashboard-container max-w-7xl mx-auto px-4 py-8">
  {#if $user}
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-slate-900 mb-2">
        Welcome back, {$user.username}
      </h1>
      <p class="text-xl text-slate-600">
        Your security dashboard and account management center
      </p>
    </div>
    
    <!-- Security Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Account Security Card -->
      <div class="security-card status-secure">
        <div class="card-icon bg-gradient-to-br from-green-500 to-green-600">
          <i class="fas fa-shield-alt text-white"></i>
        </div>
        <div class="card-content">
          <h3 class="text-lg font-semibold text-slate-900 mb-1">Account Security</h3>
          <p class="status-text text-green-600 font-medium mb-3">Fully Secured</p>
          <div class="security-score">
            <div class="score-bar">
              <div class="score-fill" style="width: {securityScore}%"></div>
            </div>
            <span class="score-label">{securityScore}% Secure</span>
          </div>
        </div>
      </div>
      
      <!-- Password Status Card -->
      <div class="security-card">
        <div class="card-icon bg-gradient-to-br from-blue-500 to-blue-600">
          <i class="fas fa-key text-white"></i>
        </div>
        <div class="card-content">
          <h3 class="text-lg font-semibold text-slate-900 mb-1">Password Status</h3>
          <p class="status-text text-green-600 font-medium mb-1">Strong & Current</p>
          <p class="text-sm text-slate-500">
            Last updated {Math.floor((Date.now() - lastPasswordUpdate.getTime()) / (24 * 60 * 60 * 1000))} days ago
          </p>
        </div>
      </div>
      
      <!-- 2FA Status Card -->
      <div class="security-card">
        <div class="card-icon bg-gradient-to-br from-purple-500 to-purple-600">
          <i class="fas fa-mobile-alt text-white"></i>
        </div>
        <div class="card-content">
          <h3 class="text-lg font-semibold text-slate-900 mb-1">2FA Status</h3>
          <p class="status-text text-green-600 font-medium mb-1">Active</p>
          <p class="text-sm text-slate-500">TOTP Authenticator</p>
        </div>
      </div>
    </div>
    
    <!-- Account Information -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Account Details -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold text-slate-900 mb-4 flex items-center">
          <i class="fas fa-user-circle mr-3 text-blue-600"></i>
          Account Details
        </h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center py-2 border-b border-slate-100">
            <span class="text-slate-600">Username</span>
            <span class="font-medium text-slate-900">{$user.username}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-slate-100">
            <span class="text-slate-600">Account Created</span>
            <span class="font-medium text-slate-900">{accountAge.toLocaleDateString()}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-slate-100">
            <span class="text-slate-600">Security Level</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i class="fas fa-shield-alt mr-1"></i>
              Maximum
            </span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-slate-600">Next Rotation</span>
            <span class="font-medium text-slate-900">
              {new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Security Features -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold text-slate-900 mb-4 flex items-center">
          <i class="fas fa-lock mr-3 text-green-600"></i>
          Security Features
        </h2>
        <div class="space-y-3">
          <div class="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <i class="fas fa-check-circle text-green-600 mr-3"></i>
            <div>
              <p class="font-medium text-green-900">24-Character Password</p>
              <p class="text-sm text-green-700">Auto-generated secure password</p>
            </div>
          </div>
          <div class="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <i class="fas fa-check-circle text-green-600 mr-3"></i>
            <div>
              <p class="font-medium text-green-900">TOTP 2FA Enabled</p>
              <p class="text-sm text-green-700">Time-based authentication active</p>
            </div>
          </div>
          <div class="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <i class="fas fa-check-circle text-green-600 mr-3"></i>
            <div>
              <p class="font-medium text-green-900">Auto Rotation</p>
              <p class="text-sm text-green-700">Credentials rotate every 6 months</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions Section -->
    <div class="actions-section">
      <h2 class="section-title mb-6">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Reset Credentials -->
        <a href="/reset" class="action-card group">
          <div class="action-icon bg-gradient-to-br from-orange-500 to-orange-600">
            <i class="fas fa-sync-alt text-white"></i>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Reset Credentials</h3>
          <p class="text-slate-600 mb-4">Generate new password and 2FA setup for enhanced security</p>
          <span class="action-arrow">→</span>
        </a>
        
        <!-- Download Backup Codes -->
        <button class="action-card group" on:click={downloadBackupCodes} disabled={downloadingBackup}>
          <div class="action-icon bg-gradient-to-br from-blue-500 to-blue-600">
            <i class="fas fa-download text-white"></i>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Backup Codes</h3>
          <p class="text-slate-600 mb-4">Download emergency access codes for account recovery</p>
          <span class="action-arrow">→</span>
        </button>
        
        <!-- Security Guide -->
        <div class="action-card group cursor-default opacity-75">
          <div class="action-icon bg-gradient-to-br from-purple-500 to-purple-600">
            <i class="fas fa-book text-white"></i>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Security Guide</h3>
          <p class="text-slate-600 mb-4">Learn about best practices and security features</p>
          <span class="text-sm text-slate-500 font-medium">Coming Soon</span>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="mt-12">
      <h2 class="section-title mb-6">Recent Activity</h2>
      <div class="card">
        <div class="divide-y divide-slate-200">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-sign-in-alt text-green-600 text-sm"></i>
              </div>
              <div>
                <p class="font-medium text-slate-900">Successful login</p>
                <p class="text-sm text-slate-500">Today at 2:34 PM</p>
              </div>
            </div>
            <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Success</span>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-sync-alt text-blue-600 text-sm"></i>
              </div>
              <div>
                <p class="font-medium text-slate-900">Credentials rotated</p>
                <p class="text-sm text-slate-500">{lastPasswordUpdate.toLocaleDateString()}</p>
              </div>
            </div>
            <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Automated</span>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-user-plus text-purple-600 text-sm"></i>
              </div>
              <div>
                <p class="font-medium text-slate-900">Account created</p>
                <p class="text-sm text-slate-500">{accountAge.toLocaleDateString()}</p>
              </div>
            </div>
            <span class="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">System</span>
          </div>
        </div>
      </div>
    </div>
    
  {:else}
    <!-- Loading State -->
    <div class="flex items-center justify-center min-h-64">
      <div class="text-center">
        <div class="spinner mb-4"></div>
        <p class="text-slate-600">Loading your dashboard...</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard-container {
    animation: fadeIn 0.5s ease-out;
  }
  
  .card-content h3 {
    margin-bottom: 0.25rem;
  }
  
  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--slate-200);
    border-top-color: var(--primary-600);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
</style>
