<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { isAuthenticated } from '$lib/stores/auth';
  import NotificationList from '$lib/components/NotificationList.svelte';
  let { children } = $props();
</script>

<div class="app">
  <header>
    <div class="container">
      <h1>COFRAP User Management</h1>
      <nav>
        <ul>
          <li><a href="/" class:active={$page.url.pathname === '/'}>Home</a></li>
          {#if $isAuthenticated}
            <li><a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a></li>
            <li><a href="/logout">Logout</a></li>
          {:else}
            <li><a href="/login" class:active={$page.url.pathname === '/login'}>Login</a></li>
            <li><a href="/register" class:active={$page.url.pathname === '/register'}>Register</a></li>
          {/if}
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <div class="container">
      {@render children()}
    </div>
  </main>

  <footer>
    <div class="container">
      <p>© {new Date().getFullYear()} COFRAP. All rights reserved.</p>
    </div>
  </footer>
  
  <!-- Notification system -->
  <NotificationList />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 0;
  }

  header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    font-size: 1.5rem;
    margin: 0;
  }

  nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  nav li {
    margin-left: 1.5rem;
  }

  nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 0;
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s;
  }

  nav a:hover, nav a.active {
    border-color: white;
  }

  main {
    flex: 1;
    padding: 2rem 0;
  }

  footer {
    background-color: #f8f9fa;
    padding: 1rem 0;
    text-align: center;
    border-top: 1px solid #e9ecef;
  }

  footer p {
    margin: 0;
    color: #6c757d;
  }
</style>
