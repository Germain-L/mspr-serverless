import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);
  
  function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
  
  return {
    subscribe,
    add: (message: string, type: NotificationType = 'info', duration = 5000, dismissible = true) => {
      const id = generateId();
      
      update(notifications => [
        ...notifications,
        { id, type, message, duration, dismissible }
      ]);
      
      return id;
    },
    remove: (id: string) => {
      update(notifications => notifications.filter(notification => notification.id !== id));
    },
    success: (message: string, duration = 5000) => {
      return addNotification(message, 'success', duration);
    },
    error: (message: string, duration = 8000) => {
      return addNotification(message, 'error', duration);
    },
    warning: (message: string, duration = 5000) => {
      return addNotification(message, 'warning', duration);
    },
    info: (message: string, duration = 3000) => {
      return addNotification(message, 'info', duration);
    }
  };
  
  function addNotification(message: string, type: NotificationType, duration: number): string {
    const id = generateId();
    
    update(notifications => [
      ...notifications,
      { id, type, message, duration, dismissible: true }
    ]);
    
    return id;
  }
}

export const notifications = createNotificationStore();
