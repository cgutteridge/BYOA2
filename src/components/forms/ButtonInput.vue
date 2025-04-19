<template>
  <div class="button-container" :class="{ 'container-full-width': fullWidth }">
    <button 
      class="button" 
      :class="[
        variant ? `button-${variant}` : '', 
        size ? `button-${size}` : '',
        { 'button-full-width': fullWidth },
        { 'button-locked': locked }
      ]"
      :style="buttonStyle"
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
import {computed} from 'vue'
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

// Compute button styles based on variant and theme
const buttonStyle = computed(() => {
  const variantType = props.variant || 'primary'
  const colors = props.disabled 
    ? questStore.getButtonColors('disabled')
    : questStore.getButtonColors(variantType)

  return {
    backgroundColor: colors.background,
    color: colors.text,
    borderColor: colors.border
  }
})

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
  border-width: 1px;
  border-style: solid;
  text-align: center;
}

.button:hover:not(:disabled):not(.button-locked) {
  filter: brightness(1.1);
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

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style> 