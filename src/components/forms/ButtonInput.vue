<template>
  <div class="button-container" :class="{ 'container-full-width': fullWidth }">
    <button 
      class="button" 
      :class="[
        variant ? `button-${variant}` : '', 
        size ? `button-${size}` : '',
        { 'button-full-width': fullWidth },
        { 'button-locked': locked },
        questStore.theme
      ]"
      :disabled="disabled"
      @click="handleClick"
    >
      <slot></slot>
    </button>
    <div v-if="locked" class="lock-overlay">
      <span class="lock-icon">🔒</span>
    </div>
  </div>
</template>

<script setup lang="ts">

import {useQuestStore} from "@/stores/questStore.ts";

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  fullWidth?: boolean
  locked?: boolean
  action?: (event?:MouseEvent) => void
}>()

const questStore = useQuestStore()

function handleClick(event: MouseEvent): void {
  if (!props.locked && !props.disabled) {
    // Call the action if provided
    if (props.action) {
      props.action(event)
    }
  }
}
</script>

<style scoped>
/* Base styles */
.button-container {
  position: relative;
  display: inline-block;
  width: fit-content;
}

.container-full-width {
  width: 100%;
  display: block;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  text-align: center;
}

.button-full-width {
  width: 100%;
}

/* Size variations */
.button-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.button-medium {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
}

.button-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Locked state */
.button-locked {
  cursor: not-allowed;
  opacity: 0.8;
}

/* Lock overlay styling */
.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.lock-icon {
  font-size: 2rem;
  opacity: 1;
}

/* Dark theme styles */
.button.dark {
  color: #ffffff;
}

.button-primary.dark {
  background: #2E7D32;
  color: white;
}

.button-secondary.dark {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f0f0f0;
}

.button-danger.dark {
  background: #c62828;
  color: white;
}

.button.dark:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #555;
  color: #a0a0a0;
  transform: none;
}

/* Light theme styles */
.button.light {
  color: #333333;
}

.button-primary.light {
  background: #43A047;
  color: white;
}

.button-secondary.light {
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  color: #333333;
}

.button-danger.light {
  background: #e53935;
  color: white;
}

.button.light:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #cccccc;
  color: #888888;
  transform: none;
}
</style> 