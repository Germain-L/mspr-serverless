<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { isAuthenticated } from '$lib/stores/auth';
  import NotificationList from '$lib/components/NotificationList.svelte';
  import { onMount } from 'svelte';
  
  let { children } = $props();
  let mobileMenuOpen = $state(false);
  let scrolled = $state(false);

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 10;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<div class="app-layout">
  <header class="header" class:scrolled>
    <div class="header-container">
      <div class="header-content">
        <!-- Logo/Brand -->
        <div class="brand">
          <a href="/" class="brand-link">
            <i class="fas fa-shield-alt brand-icon" aria-hidden="true"></i>
            <div class="brand-text">
              <span class="brand-name">COFRAP</span>
              <span class="brand-subtitle">User Management</span>
            </div>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <nav class="nav-desktop" aria-label="Main navigation">
          <ul class="nav-list">
            <li class="nav-item">
              <a 
                href="/" 
                class="nav-link"
                class:active={$page.url.pathname === '/'}
                aria-current={$page.url.pathname === '/' ? 'page' : undefined}
              >
                <i class="fas fa-home" aria-hidden="true"></i>
                <span>Home</span>
              </a>
            </li>
            {#if $isAuthenticated}
              <li class="nav-item">
                <a 
                  href="/dashboard" 
                  class="nav-link"
                  class:active={$page.url.pathname === '/dashboard'}
                  aria-current={$page.url.pathname === '/dashboard' ? 'page' : undefined}
                >
                  <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
                  <span>Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="/logout" class="nav-link logout-link">
                  <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                  <span>Logout</span>
                </a>
              </li>
            {:else}
              <li class="nav-item">
                <a 
                  href="/login" 
                  class="nav-link"
                  class:active={$page.url.pathname === '/login'}
                  aria-current={$page.url.pathname === '/login' ? 'page' : undefined}
                >
                  <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                  <span>Login</span>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  href="/register" 
                  class="nav-link register-link"
                  class:active={$page.url.pathname === '/register'}
                  aria-current={$page.url.pathname === '/register' ? 'page' : undefined}
                >
                  <i class="fas fa-user-plus" aria-hidden="true"></i>
                  <span>Register</span>
                </a>
              </li>
            {/if}
          </ul>
        </nav>

        <!-- Mobile Menu Button -->
        <button 
          class="mobile-menu-button"
          class:active={mobileMenuOpen}
          onclick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <nav 
        class="nav-mobile"
        class:open={mobileMenuOpen}
        id="mobile-menu"
        aria-label="Mobile navigation"
      >
        <ul class="mobile-nav-list">
          <li class="mobile-nav-item">
            <a 
              href="/" 
              class="mobile-nav-link"
              class:active={$page.url.pathname === '/'}
              onclick={closeMobileMenu}
              aria-current={$page.url.pathname === '/' ? 'page' : undefined}
            >
              <i class="fas fa-home" aria-hidden="true"></i>
              <span>Home</span>
            </a>
          </li>
          {#if $isAuthenticated}
            <li class="mobile-nav-item">
              <a 
                href="/dashboard" 
                class="mobile-nav-link"
                class:active={$page.url.pathname === '/dashboard'}
                onclick={closeMobileMenu}
                aria-current={$page.url.pathname === '/dashboard' ? 'page' : undefined}
              >
                <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="mobile-nav-item">
              <a 
                href="/logout" 
                class="mobile-nav-link logout-link"
                onclick={closeMobileMenu}
              >
                <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                <span>Logout</span>
              </a>
            </li>
          {:else}
            <li class="mobile-nav-item">
              <a 
                href="/login" 
                class="mobile-nav-link"
                class:active={$page.url.pathname === '/login'}
                onclick={closeMobileMenu}
                aria-current={$page.url.pathname === '/login' ? 'page' : undefined}
              >
                <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                <span>Login</span>
              </a>
            </li>
            <li class="mobile-nav-item">
              <a 
                href="/register" 
                class="mobile-nav-link register-link"
                class:active={$page.url.pathname === '/register'}
                onclick={closeMobileMenu}
                aria-current={$page.url.pathname === '/register' ? 'page' : undefined}
              >
                <i class="fas fa-user-plus" aria-hidden="true"></i>
                <span>Register</span>
              </a>
            </li>
          {/if}
        </ul>
      </nav>
    </div>

    <!-- Mobile Menu Overlay -->
    {#if mobileMenuOpen}
      <div 
        class="mobile-menu-overlay"
        onclick={closeMobileMenu}
        aria-hidden="true"
      ></div>
    {/if}
  </header>

  <main class="main-content">
    <div class="content-container">
      {@render children()}
    </div>
  </main>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <i class="fas fa-shield-alt footer-icon" aria-hidden="true"></i>
          <span class="footer-brand-text">COFRAP</span>
        </div>
        <div class="footer-links">
          <a href="/privacy" class="footer-link">Privacy Policy</a>
          <a href="/terms" class="footer-link">Terms of Service</a>
          <a href="/support" class="footer-link">Support</a>
        </div>
        <div class="footer-copyright">
          <p>© {new Date().getFullYear()} COFRAP. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
  
  <!-- Notification system -->
  <NotificationList />
</div>


