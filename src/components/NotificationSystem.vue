<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div 
        v-for="notification in appStore.notifications" 
        :key="notification.id" 
        class="notification"
        :class="[
          'notification-' + notification.type,
          { 'notification-entering': notification.isEntering }
        ]"
        :data-notification-id="notification.id"
      >
        <div class="notification-content">
          {{ notification.message }}
        </div>
        <button class="close-button" @click="appStore.removeNotification(notification.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore';
import { onMounted, onUnmounted } from 'vue';

const appStore = useAppStore();

// Set up watcher to mark new notifications as "entering" for the animation
// This will be automatically cleaned up when component is unmounted
onMounted(() => {
  appStore.$subscribe((_, state) => {
    const notificationsArray = state.notifications;
    // Find notifications that still have isEntering set to true
    const newNotifications = notificationsArray.filter(n => n.isEntering === true);
    
    // For each new notification, set up the center animation and registry
    newNotifications.forEach(notification => {
      // Add to center registry (will be used for positioning)
      // We need to get the element to measure its height
      setTimeout(() => {
        const notificationEl = document.querySelector(`[data-notification-id="${notification.id}"]`) as HTMLElement;
        if (notificationEl) {
          const height = notificationEl.offsetHeight;
          // Register notification with height
          const index = appStore.addToCenterRegistry(notification.id, height);
          
          // Apply custom positioning styles if needed
          notificationEl.style.setProperty('--notification-center-index', index.toString());
          
          // Trigger a reflow to ensure the animation applies correctly
          void notificationEl.offsetWidth;
        }
      }, 20);
      
      // Remove entering flag after animation completes
      setTimeout(() => {
        const index = appStore.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          const notificationEl = document.querySelector(`[data-notification-id="${notification.id}"]`) as HTMLElement;
          
          if (notificationEl) {
            // First remove animation to prevent conflict with transition
            notificationEl.style.animation = 'none';
            
            // Force a reflow
            void notificationEl.offsetWidth;
            
            // Now set a specific transition for moving to corner
            notificationEl.style.transition = 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            // Then set isEntering to false to trigger the move to corner
            appStore.notifications[index].isEntering = false;
          } else {
            // Fallback if element not found
            appStore.notifications[index].isEntering = false;
          }
          
          // Remove from center registry after animation completes
          setTimeout(() => {
            appStore.removeCenterNotification(notification.id);
          }, 100);
        }
      }, 800); // Match animation duration
    });
  });
});
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  pointer-events: none; /* Allow clicks through the container for center notifications */
}

.notification {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-left: 4px solid #ccc;
  transform-origin: center;
  pointer-events: auto; /* Restore click events for the notifications themselves */
}

/* Styles for the initial center position */
.notification-entering {
  position: fixed;
  top: max(100px, calc(120px + (var(--notification-center-index, 0) * 80px)));
  left: 50%;
  transform: translate(-50%, 0) scale(2.5);
  z-index: calc(10000 - var(--notification-center-index, 0)); /* Higher notifications appear on top */
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  animation: notification-poof 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: none; /* Disable transition while in center */
}

@keyframes notification-poof {
  0% {
    opacity: 0;
    transform: translate(-50%, 0) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, 0) scale(2.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(2.5);
  }
}

/* Add a special transition for notifications going from center to corner */
.notification-container .notification:not(.notification-entering) {
  position: relative;
  top: auto;
  left: auto;
  transform: scale(1); /* Final scale in the corner */
  transition: transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-success {
  border-left-color: #4caf50;
}

.notification-error {
  border-left-color: #f44336;
}

.notification-info {
  border-left-color: #2196f3;
}

.notification-warning {
  border-left-color: #ff9800;
}

.notification-content {
  flex: 1;
  margin-right: 10px;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

/* Animation */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.8);
}
</style> 