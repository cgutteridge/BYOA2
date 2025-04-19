<template>
  <div class="button-picker" :class="[questStore.theme]">
    <h3 v-if="title">{{ title }}</h3>
    <div class="button-options">
      <template v-if="options && options.length > 0">
        <ButtonInput
          v-for="(option, index) in normalizedOptions"
          :key="`btn-option-${option.id || index}`"
          :variant="isSelected(option) ? 'primary' : 'secondary'"
          :disabled="isDisabled(option)"
          :theme="questStore.theme"
          @click="selectOption(option)"
          class="picker-button"
          :class="{ 'selected': isSelected(option) }"
        >
          {{ option.name || option.title || option.label || option }}
        </ButtonInput>
      </template>
      <template v-else>
        <slot></slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ButtonInput from '@/components/forms/ButtonInput.vue'
import {useQuestStore} from "@/stores/questStore.ts";

const questStore = useQuestStore()

interface ButtonOption {
  id?: string | number
  name?: string
  title?: string
  label?: string
  disabled?: boolean
  [key: string]: any
}

const props = defineProps<{
  options?: ButtonOption[] | string[] | number[]
  modelValue?: any // Current selected value
  title?: string
  valueProperty?: string
  disabled?: boolean
  disabledOptions?: any[]
}>()

const emit = defineEmits(['update:modelValue', 'selection-change'])

// Function to convert simple options to objects
const normalizedOptions = computed(() => {
  if (!props.options) return []
  
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
  if (!props.modelValue) return false
  
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
  flex: 1;
  min-width: 80px;
}

/* Dark theme styles */
.button-picker.dark h3 {
  color: #ffffff;
}

/* Light theme styles */
.button-picker.light h3 {
  color: #333333;
}
</style> 