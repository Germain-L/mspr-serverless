<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { isAuthenticated } from '$lib/stores/auth';
  import NotificationList from '$lib/components/NotificationList.svelte';
  let { children } = $props();
</script>

<div class="flex flex-col min-h-screen">
  <header class="bg-slate-800 text-white py-4">
    <div class="w-full max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold m-0">COFRAP User Management</h1>
        <nav>
          <ul class="flex list-none m-0 p-0">
            <li class="ml-6 first:ml-0">
              <a href="/" class={`text-white no-underline py-2 border-b-2 ${$page.url.pathname === '/' ? 'border-white' : 'border-transparent'} hover:border-white transition-colors`}>Home</a>
            </li>
            {#if $isAuthenticated}
              <li class="ml-6">
                <a href="/dashboard" class={`text-white no-underline py-2 border-b-2 ${$page.url.pathname === '/dashboard' ? 'border-white' : 'border-transparent'} hover:border-white transition-colors`}>Dashboard</a>
              </li>
              <li class="ml-6">
                <a href="/logout" class="text-white no-underline py-2 border-b-2 border-transparent hover:border-white transition-colors">Logout</a>
              </li>
            {:else}
              <li class="ml-6">
                <a href="/login" class={`text-white no-underline py-2 border-b-2 ${$page.url.pathname === '/login' ? 'border-white' : 'border-transparent'} hover:border-white transition-colors`}>Login</a>
              </li>
              <li class="ml-6">
                <a href="/register" class={`text-white no-underline py-2 border-b-2 ${$page.url.pathname === '/register' ? 'border-white' : 'border-transparent'} hover:border-white transition-colors`}>Register</a>
              </li>
            {/if}
          </ul>
        </nav>
      </div>
    </div>
  </header>

  <main class="flex-1 py-8">
    <div class="w-full max-w-7xl mx-auto px-4">
      {@render children()}
    </div>
  </main>

  <footer class="bg-gray-100 py-4 text-center border-t border-gray-200">
    <div class="w-full max-w-7xl mx-auto px-4">
      <p class="m-0 text-gray-500">© {new Date().getFullYear()} COFRAP. All rights reserved.</p>
    </div>
  </footer>
  
  <!-- Notification system -->
  <NotificationList />
</div>


