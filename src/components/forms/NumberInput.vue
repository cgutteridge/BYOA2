<template>
  <div class="counter-picker" :style="pickerStyle">
    <h3 v-if="title" :style="titleStyle">{{ title }}</h3>
    <div class="counter-control">
      <button 
        class="counter-button decrement" 
        @click="decrement" 
        :disabled="disabled || value <= (min ?? 0)"
        :style="buttonStyle"
      >
        {{ decrementText || '-' }}
      </button>
      <div class="counter-value" :style="valueStyle">{{ displayValue || value }}</div>
      <button 
        class="counter-button increment" 
        @click="increment"
        :disabled="disabled || value >= (max ?? Infinity)"
        :style="buttonStyle"
      >
        {{ incrementText || '+' }}
      </button>
    </div>
    <div v-if="description" class="counter-description" v-html="description" :style="descriptionStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuestStore } from '@/stores/questStore'

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
}>()

const emit = defineEmits(['update:modelValue', 'change'])
const questStore = useQuestStore()

// Theme-based styles
const pickerStyle = computed(() => ({
  color: questStore.getTextColor('primary')
}))

const titleStyle = computed(() => ({
  color: questStore.getTextColor('primary')
}))

const valueStyle = computed(() => ({
  color: questStore.getTextColor('primary')
}))

const buttonStyle = computed(() => {
  const isDisabled = props.disabled;
  
  return {
    backgroundColor: isDisabled 
      ? questStore.getButtonColors('disabled').background 
      : questStore.getButtonColors('secondary').background,
    color: isDisabled 
      ? questStore.getButtonColors('disabled').text 
      : questStore.getButtonColors('secondary').text,
    borderColor: isDisabled 
      ? questStore.getButtonColors('disabled').border 
      : questStore.getButtonColors('secondary').border
  }
})

const descriptionStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light')
}))

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
  border-width: 1px;
  border-style: solid;
}

.counter-button:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.counter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  border-width: 1px;
  border-style: solid;
}
</style> 