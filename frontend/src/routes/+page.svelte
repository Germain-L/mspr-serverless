<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
</script>

<div class="hero">
  <h1>Welcome to COFRAP User Management System</h1>
  <p>A secure authentication system with automatic password generation and 2FA</p>
  
  <div class="cta-buttons">
    {#if $isAuthenticated}
      <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
    {:else}
      <a href="/login" class="btn btn-primary">Login</a>
      <a href="/register" class="btn btn-secondary">Create Account</a>
    {/if}
  </div>
</div>

<div class="features">
  <div class="feature">
    <h2>Secure Password Generation</h2>
    <p>Automatically generate secure 24-character passwords with special characters, numbers, and mixed case.</p>
  </div>
  
  <div class="feature">
    <h2>Two-Factor Authentication</h2>
    <p>Enhanced security with mandatory two-factor authentication for all accounts.</p>
  </div>
  
  <div class="feature">
    <h2>Credential Rotation</h2>
    <p>Automatic credential rotation every six months to maintain security standards.</p>
  </div>
</div>

<style>
  .hero {
    text-align: center;
    padding: 3rem 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .hero p {
    font-size: 1.25rem;
    color: #6c757d;
    margin-bottom: 2rem;
  }
  
  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-weight: 500;
    text-align: center;
    transition: background-color 0.2s;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2980b9;
  }
  
  .btn-secondary {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
  
  .btn-secondary:hover {
    background-color: #bdc3c7;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
  }
  
  .feature {
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .feature h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .feature p {
    color: #6c757d;
  }
  
  @media (max-width: 768px) {
    .features {
      grid-template-columns: 1fr;
    }
    
    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .btn {
      width: 100%;
      max-width: 300px;
      margin-bottom: 0.5rem;
    }
  }
</style>
