<template>
  <div class="button-picker" :class="[theme]">
    <h3 v-if="title">{{ title }}</h3>
    <div class="button-options">
      <button
        v-for="(option, index) in normalizedOptions"
        :key="`btn-option-${option.id || index}`"
        class="picker-button"
        :class="{ 
          'selected': isSelected(option),
          'disabled': isDisabled(option)
        }"
        :disabled="isDisabled(option)"
        @click="selectOption(option)"
      >
        {{ option.name || option.title || option.label || option }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ButtonOption {
  id?: string | number
  name?: string
  title?: string
  label?: string
  disabled?: boolean
  [key: string]: any
}

const props = defineProps<{
  options: ButtonOption[] | string[] | number[]
  modelValue: any // Current selected value
  title?: string
  valueProperty?: string
  disabled?: boolean
  disabledOptions?: any[]
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits(['update:modelValue', 'selection-change'])

// Default theme (fallback to dark if not specified)
const theme = computed(() => props.theme || 'dark')

// Function to convert simple options to objects
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        id: option,
        name: option.toString()
      }
    }
    return option
  })
})

// Determine if an option is selected
function isSelected(option: ButtonOption): boolean {
  if (typeof props.modelValue === 'object' && props.modelValue !== null) {
    const valueProperty = props.valueProperty || 'id'
    return props.modelValue[valueProperty] === option[valueProperty]
  }
  return props.modelValue === option.id || props.modelValue === option
}

// Check if an option is disabled
function isDisabled(option: ButtonOption): boolean {
  if (props.disabled) return true
  if (option.disabled) return true
  
  if (props.disabledOptions && props.disabledOptions.length > 0) {
    return props.disabledOptions.some(val => {
      if (typeof val === 'object' && val !== null) {
        const valueProperty = props.valueProperty || 'id'
        return val[valueProperty] === option[valueProperty]
      }
      return val === option.id || val === option
    })
  }
  
  return false
}

// Select an option
function selectOption(option: ButtonOption): void {
  const valueProperty = props.valueProperty || 'id'
  const optionValue = typeof option === 'object' ? option[valueProperty] : option
  
  // Emit the selected value
  emit('update:modelValue', optionValue)
  emit('selection-change', optionValue)
}
</script>

<style scoped>
/* Base styles */
.button-picker {
  margin: 1rem 0;
}

.button-picker h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.button-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.picker-button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 80px;
}

/* Dark theme styles */
.button-picker.dark h3 {
  color: #ffffff;
}

.button-picker.dark .picker-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f0f0f0;
}

.button-picker.dark .picker-button:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.button-picker.dark .picker-button.selected {
  background: #2E7D32; /* Darker green for better contrast */
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.button-picker.dark .picker-button.selected:hover {
  background: #1B5E20; /* Even darker green on hover for better distinction */
  transform: translateY(-2px);
}

.button-picker.dark .picker-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #555;
  color: #a0a0a0;
}

/* Light theme styles */
.button-picker.light h3 {
  color: #333333;
}

.button-picker.light .picker-button {
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  color: #333333;
}

.button-picker.light .picker-button:hover:not(.disabled) {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.button-picker.light .picker-button.selected {
  background: #43A047; /* Bright green */
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-picker.light .picker-button.selected:hover {
  background: #2E7D32; /* Darker green on hover for better distinction */
  transform: translateY(-2px);
}

.button-picker.light .picker-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #cccccc;
  color: #888888;
}
</style> 