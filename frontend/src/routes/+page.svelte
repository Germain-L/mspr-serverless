<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
</script>

<div class="text-center py-12 px-4 max-w-3xl mx-auto">
  <h1 class="text-4xl font-bold mb-4 text-slate-800">Welcome to COFRAP User Management System</h1>
  <p class="text-xl text-gray-500 mb-8">A secure authentication system with automatic password generation and 2FA</p>
  
  <div class="flex justify-center gap-4 mt-8">
    {#if $isAuthenticated}
      <a href="/dashboard" class="inline-block px-6 py-3 rounded text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors">Go to Dashboard</a>
    {:else}
      <a href="/login" class="inline-block px-6 py-3 rounded text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors">Login</a>
      <a href="/register" class="inline-block px-6 py-3 rounded font-medium bg-gray-100 text-slate-800 hover:bg-gray-200 transition-colors">Create Account</a>
    {/if}
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-7xl mx-auto px-4">
  <div class="p-6 bg-gray-50 rounded-lg shadow-sm">
    <h2 class="text-2xl font-semibold mb-4 text-slate-800">Secure Password Generation</h2>
    <p class="text-gray-500">Automatically generate secure 24-character passwords with special characters, numbers, and mixed case.</p>
  </div>
  
  <div class="p-6 bg-gray-50 rounded-lg shadow-sm">
    <h2 class="text-2xl font-semibold mb-4 text-slate-800">Two-Factor Authentication</h2>
    <p class="text-gray-500">Enhanced security with mandatory two-factor authentication for all accounts.</p>
  </div>
  
  <div class="p-6 bg-gray-50 rounded-lg shadow-sm">
    <h2 class="text-2xl font-semibold mb-4 text-slate-800">Credential Rotation</h2>
    <p class="text-gray-500">Automatic credential rotation every six months to maintain security standards.</p>
  </div>
</div>



