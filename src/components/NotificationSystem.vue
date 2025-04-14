<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div 
        v-for="notification in appStore.notifications" 
        :key="notification.id" 
        class="notification"
        :class="'notification-' + notification.type"
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

const appStore = useAppStore();
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
  transition: all 0.3s ease;
  border-left: 4px solid #ccc;
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
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style> 