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
import { onMounted } from 'vue';

const appStore = useAppStore();

// Set up watcher to mark new notifications as "entering" for the animation
// This will be automatically cleaned up when component is unmounted
onMounted(() => {
  // When notifications array changes
  appStore.$subscribe((_, state) => {
    const notificationsArray = state.notifications;
    
    // Process all notifications to set their vertical position
    notificationsArray.forEach(notification => {
      if (notification.isEntering) {
        // Find and update position based on centerIndex
        setTimeout(() => {
          const notificationEl = document.querySelector(`[data-notification-id="${notification.id}"]`) as HTMLElement;
          if (notificationEl && typeof notification.centerIndex === 'number') {
            // Calculate offset with padding between notifications
            // The offset is calculated based on the index and a fixed padding
            const padding = 60; // Padding between notifications
            const baseHeight = 70; // Estimated base height of a notification with reduced padding
            const offset = notification.centerIndex * (baseHeight + padding);
            
            // Set custom properties for positioning
            notificationEl.style.setProperty('--notification-index', notification.centerIndex.toString());
            notificationEl.style.setProperty('--notification-offset', `${offset}px`);
          }
        }, 0);
      }
    });
    
    // Find notifications that are entering
    const newNotifications = notificationsArray.filter(n => n.isEntering === true);
    
    // For each new notification, set up timing to end center animation
    newNotifications.forEach(notification => {
      // Get animation duration based on screen size
      let animationDuration = 2000; // Default for desktop
      
      if (window.matchMedia('(max-width: 480px)').matches) {
        animationDuration = 1600; // Small mobile
      } else if (window.matchMedia('(max-width: 768px)').matches) {
        animationDuration = 1800; // Tablet/medium mobile
      }
      
      // Remove entering flag after animation completes
      setTimeout(() => {
        // Call the store method to exit the center animation
        appStore.exitCenterAnimation(notification.id);
      }, animationDuration);
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
  padding: 8px 16px;
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
  top: calc(20vh + var(--notification-offset, 0));
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  z-index: calc(10000 - var(--notification-index, 0)); /* Higher z-index for earlier notifications */
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  transform-origin: center;
}

.notification-entering {
  animation: poof-animation 2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes poof-animation {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(2);
  }
  30% {
    transform: translate(-50%, -50%) scale(1.8);
  }
  90% {
    transform: translate(-50%, -50%) scale(1.8);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
  }
}

/* Mobile-specific animation scales */
@media screen and (max-width: 768px) {
  .notification-entering {
    animation: poof-animation 1.8s cubic-bezier(0.175, 0.885, 0.32, 1.2);
    top: calc(30vh + var(--notification-offset, 0));
  }
  
  @keyframes poof-animation {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.2);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.5);
    }
    30% {
      transform: translate(-50%, -50%) scale(1.3);
    }
    90% {
      transform: translate(-50%, -50%) scale(1.3);
    }
    100% {
      transform: translate(-50%, -50%) scale(1.3);
    }
  }
  
  .notification-container {
    top: 15px;
    right: 15px;
    max-width: 90vw;
    gap: 8px;
  }
  
  .notification {
    padding: 6px 12px;
    font-size: 0.95rem;
  }
  
  .notification-content {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}

/* Small mobile screens */
@media screen and (max-width: 480px) {
  .notification-entering {
    animation: poof-animation 1.6s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    top: calc(25vh + var(--notification-offset, 0));
  }
  
  @keyframes poof-animation {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.2);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
    30% {
      transform: translate(-50%, -50%) scale(1.1);
    }
    90% {
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
  
  .notification {
    padding: 5px 10px;
    font-size: 0.9rem;
    max-width: 85vw;
  }
  
  .notification-content {
    margin-right: 5px;
    line-height: 1.3;
  }
  
  .close-button {
    width: 20px;
    height: 20px;
    font-size: 16px;
  }
  
  .notification-container {
    top: 10px;
    right: 10px;
    gap: 6px;
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