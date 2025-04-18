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
    
    // For each new notification, set up the center animation 
    newNotifications.forEach(notification => {
      // Remove entering flag after animation completes
      setTimeout(() => {
        const index = appStore.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          // Add class for transition animation
          appStore.notifications[index].isEntering = false;
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
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  will-change: transform, opacity;
  pointer-events: auto; /* Restore click events for the notifications themselves */
}

/* Styles for the initial center position */
.notification-entering {
  position: fixed;
  top: 30vh;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  z-index: 10000; /* Higher than regular notifications */
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  transform-origin: center;
}

.notification-entering {
  animation: poof-animation 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes poof-animation {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }
  25% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(3);
  }
  50% {
    transform: translate(-50%, -50%) scale(2.5);
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
  }
}

/* Add a special transition for notifications going from center to corner */
.notification-container .notification:not(.notification-entering) {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: scale(1); /* Final scale in the corner */
  position: relative; /* Reset position from absolute to normal flow */
  top: auto;
  left: auto;
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