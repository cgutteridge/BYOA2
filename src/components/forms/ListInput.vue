<template>
  <div class="picker-container" :class="[theme]">
    <h3 v-if="title">{{ title }}</h3>
    
    <!-- Search field (optional) -->
    <input 
      v-if="searchable"
      type="text" 
      v-model="searchText" 
      :placeholder="placeholder || 'Search...'"
      @focus="showList = true"
      @input="showList = true"
      class="picker-search"
    />
    
    <!-- Options list -->
    <div v-if="shouldShowList" class="picker-list">
      <div 
        v-for="(option, index) in filteredOptions" 
        :key="`option-${option.id || index}`" 
        class="picker-item"
        :class="{ 
          'selected': isSelected(option),
          'disabled': isDisabled(option)
        }"
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
      
      <div v-if="filteredOptions.length === 0" class="no-options">
        No options available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits(['update:modelValue', 'selection-change'])

// Local state
const searchText = ref('')
const showList = ref(props.alwaysShow || false)

// Set showList to true if alwaysShow is true
if (props.alwaysShow) {
  showList.value = true
}

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
  console.log('Selected option:', option)
  
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

// Close dropdown when clicking outside for searchable pickers
function handleClickOutside(event: MouseEvent) {
  // Only apply to searchable pickers
  if (!props.searchable || props.alwaysShow) return;
  
  const target = event.target as HTMLElement
  if (!target.closest('.picker-container')) {
    showList.value = false
  }
}

// Update searchText when modelValue changes for searchable single-select pickers
watch(() => props.modelValue, (newValue) => {
  if (props.searchable && !props.multiple && newValue) {
    const option = normalizedOptions.value.find(opt => {
      const valueProperty = props.valueProperty || 'id'
      if (typeof newValue === 'object' && newValue !== null) {
        return opt[valueProperty] === newValue[valueProperty]
      }
      return opt[valueProperty] === newValue || opt.id === newValue || opt === newValue
    })
    
    if (option) {
      const displayProperty = props.displayProperty || 'name'
      searchText.value = typeof option === 'object' ? (option[displayProperty] || option.title || option.label || '') : String(option)
    }
  }
}, { immediate: true })

// Computed property to determine if list should be shown
const shouldShowList = computed(() => {
  // Always show if alwaysShow is true
  if (props.alwaysShow) return true;
  
  // For searchable pickers, show when search is active or text exists
  if (props.searchable) {
    return showList.value && searchText.value;
  }
  
  // Don't show by default
  return false;
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Base styles */
.picker-container {
  position: relative;
  width: 100%;
  margin-bottom: 0.5rem; /* Add margin to ensure space below the container */
}

.picker-container h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.picker-search {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem; /* Add margin bottom to create space between search and list */
  border-radius: 8px;
  font-size: 1rem;
}

.picker-list {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
  z-index: 1000;
  margin-top: 0.5rem;
  /* Removed position: absolute */
}

.picker-item {
  padding: 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  gap: 0.5rem;
}

.picker-item-content {
  flex: 1;
}

.picker-item-count {
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.picker-item-title {
  font-weight: 500;
}

.picker-item-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
}

.no-options {
  padding: 0.8rem;
  text-align: center;
  font-style: italic;
}

/* Dark theme (default) */
.picker-container.dark h3 {
  color: #ffffff;
}

.picker-container.dark .picker-search {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.picker-container.dark .picker-list {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.picker-container.dark .picker-item {
  color: #f0f0f0;
}

.picker-container.dark .picker-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.picker-container.dark .picker-item.selected {
  background: #2E7D32; /* Darker green for better contrast */
  color: white;
}

.picker-container.dark .picker-item.selected:hover {
  background: #1B5E20; /* Even darker green on hover for better distinction */
}

.picker-container.dark .picker-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #a0a0a0;
}

.picker-container.dark .no-options {
  color: rgba(255, 255, 255, 0.6);
}

/* Light theme */
.picker-container.light h3 {
  color: #333333;
}

.picker-container.light .picker-search {
  background: #ffffff;
  border: 1px solid #d0d0d0;
  color: #333333;
}

.picker-container.light .picker-list {
  background: #ffffff;
  border: 1px solid #d0d0d0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.picker-container.light .picker-item {
  color: #333333;
}

.picker-container.light .picker-item:hover:not(.disabled) {
  background: #f0f0f0;
}

.picker-container.light .picker-item.selected {
  background: #43A047; /* Bright green */
  color: white;
}

.picker-container.light .picker-item.selected:hover {
  background: #2E7D32; /* Darker green on hover for better distinction */
}

.picker-container.light .picker-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #888888;
}

.picker-container.light .no-options {
  color: #888888;
}

/* Add a nice subtle separator between items */
.picker-item:not(:last-child) {
  border-bottom: 1px solid rgba(200, 200, 200, 0.1);
}
</style> 