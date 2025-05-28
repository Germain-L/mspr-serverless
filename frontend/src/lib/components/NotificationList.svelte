<script lang="ts">
  import { notifications } from '$lib/stores/notification';
  import Notification from './Notification.svelte';
</script>

<div class="notification-container">
  {#each $notifications as notification (notification.id)}
    <Notification
      type={notification.type}
      message={notification.message}
      duration={notification.duration || 5000}
      dismissible={notification.dismissible !== false}
      on:dismiss={() => notifications.remove(notification.id)}
    />
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
  }
</style>
