<template>
  <div class="counter-picker" :class="[theme]">
    <h3 v-if="title">{{ title }}</h3>
    <div class="counter-control">
      <button 
        class="counter-button decrement" 
        @click="decrement" 
        :disabled="disabled || value <= min"
      >
        {{ decrementText || '-' }}
      </button>
      <div class="counter-value">{{ displayValue || value }}</div>
      <button 
        class="counter-button increment" 
        @click="increment"
        :disabled="disabled || value >= max"
      >
        {{ incrementText || '+' }}
      </button>
    </div>
    <div v-if="description" class="counter-description" v-html="description"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  min?: number
  max?: number 
  step?: number
  title?: string
  displayValue?: string | number
  description?: string
  disabled?: boolean
  decrementText?: string
  incrementText?: string
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits(['update:modelValue', 'change'])

// Default theme (fallback to dark if not specified)
const theme = computed(() => props.theme || 'dark')

// Computed property to get the current value
const value = computed(() => props.modelValue)

// Increment the counter
function increment() {
  if (props.disabled || (props.max !== undefined && value.value >= props.max)) {
    return
  }
  
  const step = props.step || 1
  const newValue = value.value + step
  
  // Apply max limit if specified
  const limitedValue = props.max !== undefined ? Math.min(newValue, props.max) : newValue
  
  emit('update:modelValue', limitedValue)
  emit('change', limitedValue)
}

// Decrement the counter
function decrement() {
  if (props.disabled || (props.min !== undefined && value.value <= props.min)) {
    return
  }
  
  const step = props.step || 1
  const newValue = value.value - step
  
  // Apply min limit if specified
  const limitedValue = props.min !== undefined ? Math.max(newValue, props.min) : newValue
  
  emit('update:modelValue', limitedValue)
  emit('change', limitedValue)
}
</script>

<style scoped>
/* Base styles */
.counter-picker {
  margin: 1rem 0;
}

.counter-picker h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.counter-control {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
}

.counter-button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 auto;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-value {
  font-size: 1.2rem;
  flex: 1;
  text-align: center;
  min-width: 50px;
  font-weight: bold;
}

.counter-description {
  font-size: 0.85rem;
  text-align: center;
  margin-top: 1rem;
  line-height: 1.5;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  padding: 0.8rem;
  border-radius: 8px;
}

/* Dark theme styles */
.counter-picker.dark h3 {
  color: #ffffff;
}

.counter-picker.dark .counter-value {
  color: #ffffff;
}

.counter-picker.dark .counter-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f0f0f0;
}

.counter-picker.dark .counter-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.counter-picker.dark .counter-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #555;
  color: #a0a0a0;
}

.counter-picker.dark .counter-description {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
}

/* Light theme styles */
.counter-picker.light h3 {
  color: #333333;
}

.counter-picker.light .counter-value {
  color: #333333;
}

.counter-picker.light .counter-button {
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  color: #333333;
}

.counter-picker.light .counter-button:hover:not(:disabled) {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.counter-picker.light .counter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #cccccc;
  color: #888888;
}

.counter-picker.light .counter-description {
  color: #555555;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
}
</style> 