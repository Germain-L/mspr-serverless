<script lang="ts">
  import { notifications } from '$lib/stores/notification';
  import Notification from './Notification.svelte';
</script>

<div class="fixed top-4 right-4 flex flex-col gap-2 z-50">
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
