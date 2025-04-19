<template>
  <button 
    class="button" 
    :class="[
      variant ? `button-${variant}` : '', 
      size ? `button-${size}` : '',
      { 'button-full-width': fullWidth },
      theme
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  fullWidth?: boolean
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits(['click'])

// Default theme (fallback to dark if not specified)
const theme = computed((): string => props.theme || 'dark')

function handleClick(event: Event): void {
  emit('click', event)
}
</script>

<style scoped>
/* Base styles */
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

/* Dark theme styles */
.button.dark {
  color: #ffffff;
}

.button-primary.dark {
  background: #2E7D32;
  color: white;
}

.button-primary.dark:hover:not(:disabled) {
  background: #1B5E20;
  transform: translateY(-2px);
}

.button-secondary.dark {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f0f0f0;
}

.button-secondary.dark:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.button-danger.dark {
  background: #c62828;
  color: white;
}

.button-danger.dark:hover:not(:disabled) {
  background: #b71c1c;
  transform: translateY(-2px);
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

.button-primary.light:hover:not(:disabled) {
  background: #2E7D32;
  transform: translateY(-2px);
}

.button-secondary.light {
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  color: #333333;
}

.button-secondary.light:hover:not(:disabled) {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.button-danger.light {
  background: #e53935;
  color: white;
}

.button-danger.light:hover:not(:disabled) {
  background: #c62828;
  transform: translateY(-2px);
}

.button.light:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #cccccc;
  color: #888888;
  transform: none;
}
</style> 