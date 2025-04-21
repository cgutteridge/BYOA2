<template>
  <div class="picker-container" :style="containerStyle">
    <h3 v-if="title" :style="titleStyle">{{ title }}</h3>
    
    <!-- Search field (optional) -->
    <input 
      v-if="searchable"
      type="text" 
      v-model="searchText" 
      :placeholder="placeholder || 'Search...'"
      @focus="showList = true"
      @input="showList = true"
      class="picker-search"
      :style="inputStyle"
    />
    
    <!-- Options list -->
    <div v-if="shouldShowList" class="picker-list" :style="listStyle">
      <div 
        v-for="(option, index) in filteredOptions" 
        :key="`option-${option.id || index}`" 
        class="picker-item"
        :class="{ 
          'selected': isSelected(option),
          'disabled': isDisabled(option)
        }"
        :style="getItemStyle(isSelected(option), isDisabled(option))"
        @click="!isDisabled(option) && selectOption(option)"
      >
        <div class="picker-item-count" v-if="option.count">
          {{ option.count }}x
        </div>
        <div class="picker-item-content">
          <div class="picker-item-title">{{ option.name || option.title || option.label || option }}</div>
          <div class="picker-item-subtitle" v-if="option.subtitle">{{ option.subtitle }}</div>
        </div>
      </div>
      
      <div v-if="filteredOptions.length === 0" class="no-options" :style="noOptionsStyle">
        No options available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuestStore } from '@/stores/questStore'

interface PickerOption {
  id?: string | number
  name?: string
  title?: string
  label?: string
  subtitle?: string
  count?: number
  disabled?: boolean
  [key: string]: any
}

const props = defineProps<{
  options: PickerOption[] | string[] | number[]
  modelValue: any | any[] // Current selected value(s)
  title?: string
  searchable?: boolean
  placeholder?: string
  alwaysShow?: boolean
  multiple?: boolean
  maxSelections?: number
  displayProperty?: string
  valueProperty?: string
  disabled?: boolean
  disabledOptions?: any[]
}>()

const emit = defineEmits(['update:modelValue', 'selection-change'])
const questStore = useQuestStore()

// Local state
const searchText = ref('')
const showList = ref(props.alwaysShow || false)

// Set showList to true if alwaysShow is true
if (props.alwaysShow) {
  showList.value = true
}

// Theme-based styles
const containerStyle = computed(() => ({
  color: questStore.getTextColor('primary')
}))

const titleStyle = computed(() => ({
  color: questStore.getTextColor('primary')
}))

const inputStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium')
}))

const listStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  borderColor: questStore.getBorderColor('medium'),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
}))

const noOptionsStyle = computed(() => ({
  color: questStore.getTextColor('secondary')
}))

function getItemStyle(isSelected: boolean, isDisabled: boolean) {
  if (isDisabled) {
    return {
      backgroundColor: questStore.getButtonColors('disabled').background,
      color: questStore.getButtonColors('disabled').text,
      borderColor: questStore.getBorderColor('light')
    }
  }

  if (isSelected) {
    return {
      backgroundColor: questStore.getButtonColors('primary').background,
      color: questStore.getButtonColors('primary').text,
      borderColor: questStore.getBorderColor('accent')
    }
  }

  return {
    borderColor: questStore.getBorderColor('light'),
    color: questStore.getTextColor('primary')
  }
}

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

// Filter options based on search text
const filteredOptions = computed(() => {
  if (!props.searchable || !searchText.value) {
    return normalizedOptions.value
  }
  
  const searchTerm = searchText.value.toLowerCase()
  return normalizedOptions.value.filter(option => {
    // Search in name, title, or label properties
    const searchIn = [
      option.name,
      option.title,
      option.label,
      option.subtitle
    ].filter(Boolean).map(val => val?.toLowerCase() ?? '')
    
    return searchIn.some(text => text.includes(searchTerm))
  })
})

// Only show list if showList is true (and not alwaysShow)
const shouldShowList = computed(() => {
  return props.alwaysShow || showList.value
})

// Determine if an option is selected
function isSelected(option: PickerOption): boolean {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const valueProperty = props.valueProperty || 'id'
    return props.modelValue.some(val => {
      if (typeof val === 'object' && val !== null) {
        return val[valueProperty] === option[valueProperty]
      }
      return val === option[valueProperty] || val === option.id || val === option
    })
  } else {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      const valueProperty = props.valueProperty || 'id'
      return props.modelValue[valueProperty] === option[valueProperty]
    }
    return props.modelValue === option.id || props.modelValue === option
  }
}

// Check if an option is disabled
function isDisabled(option: PickerOption): boolean {
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
function selectOption(option: PickerOption): void {
  // console.log('Selected option:', option)
  
  if (props.multiple) {
    const valueProperty = props.valueProperty || 'id'
    const optionValue = typeof option === 'object' ? option[valueProperty] : option
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    
    // Find the index of the option if it's already selected
    const index = currentValues.findIndex(val => {
      if (typeof val === 'object' && val !== null) {
        return val[valueProperty] === optionValue
      }
      return val === optionValue
    })
    
    if (index >= 0) {
      // Deselect (remove from array)
      currentValues.splice(index, 1)
    } else if (!props.maxSelections || currentValues.length < props.maxSelections) {
      // Select if under max selections
      currentValues.push(optionValue)
    }
    
    emit('update:modelValue', currentValues)
    emit('selection-change', currentValues)
    
  } else {
    // Single selection - emit the whole object for complex types or the ID
    const valueProperty = props.valueProperty || 'id'
    const optionValue = typeof option === 'object' ? option[valueProperty] : option
    
    // Emit the value ID and the full object in the event for flexibility
    emit('update:modelValue', optionValue)
    emit('selection-change', option)
    
    if (props.searchable) {
      // Update search text to match selection for searchable pickers
      const displayProperty = props.displayProperty || 'name'
      searchText.value = typeof option === 'object' ? (option[displayProperty] || option.title || option.label || '') : String(option)
      showList.value = false
    }
  }
}

// Click outside to close dropdown
function handleOutsideClick(event: MouseEvent) {
  const pickerContainer = document.querySelector('.picker-container') as Element
  if (pickerContainer && !pickerContainer.contains(event.target as Node)) {
    showList.value = false
  }
}

// Mount and cleanup event listeners
onMounted(() => {
  if (!props.alwaysShow) {
    document.addEventListener('click', handleOutsideClick)
  }
})

onUnmounted(() => {
  if (!props.alwaysShow) {
    document.removeEventListener('click', handleOutsideClick)
  }
})

// Watch for model changes and update search text
watch(() => props.modelValue, (newValue) => {
  if (props.searchable && !Array.isArray(newValue)) {
    // Find the option
    const option = normalizedOptions.value.find(option => {
      const valueProperty = props.valueProperty || 'id'
      if (typeof newValue === 'object' && newValue !== null) {
        return option[valueProperty] === newValue[valueProperty]
      }
      return option.id === newValue || option === newValue
    })
    
    if (option) {
      const displayProperty = props.displayProperty || 'name'
      searchText.value = option[displayProperty] || option.title || option.label || ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
.picker-container {
  position: relative;
  margin: 1rem 0;
}

.picker-container h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.picker-search {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border-width: 1px;
  border-style: solid;
  outline: none;
  transition: all 0.3s ease;
}

.picker-list {
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
}

.picker-item {
  padding: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-style: solid;
}

.picker-item:last-child {
  border-bottom: none;
}

.picker-item:hover:not(.disabled) {
  filter: brightness(1.1);
}

.picker-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.picker-item-count {
  font-weight: bold;
  margin-right: 1rem;
  font-size: 1.1rem;
}

.picker-item-content {
  flex: 1;
  overflow: hidden;
}

.picker-item-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-item-subtitle {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-options {
  padding: 1rem;
  text-align: center;
  font-style: italic;
}
</style> 