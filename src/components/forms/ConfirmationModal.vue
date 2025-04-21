<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirmation-modal">
      <div class="confirmation-modal__backdrop" @click="handleCancel"></div>
      <div class="confirmation-modal__content">
        <div class="confirmation-modal__question">{{ question }}</div>
        <div class="confirmation-modal__actions">
          <ButtonInput 
            variant="danger" 
            @click="handleAction"
          >
            {{ actionText }}
          </ButtonInput>
          <ButtonInput 
            variant="secondary" 
            @click="handleCancel"
          >
            {{ cancelText }}
          </ButtonInput>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useQuestStore } from '@/stores/questStore'
import ButtonInput from '@/components/forms/ButtonInput.vue'

interface Props {
  modelValue: boolean
  question: string
  actionText: string
  cancelText: string
  action: () => void
  cancelAction?: () => void
}

// Define props with TypeScript interface
const props = defineProps<Props>()

// Define emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const questStore = useQuestStore()

function handleAction(): void {
  emit('update:modelValue', false)
  props.action()
}

function handleCancel(): void {
  emit('update:modelValue', false)
  if (props.cancelAction) {
    props.cancelAction()
  }
}
</script>

<style scoped>
.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirmation-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.confirmation-modal__content {
  position: relative;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  border-radius: 12px;
  background-color: v-bind('questStore.getBackgroundColor("modal")');
  color: v-bind('questStore.getTextColor("primary")');
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.confirmation-modal__question {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.confirmation-modal__actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media screen and (max-width: 767px) {
  .confirmation-modal__content {
    width: 95%;
    padding: 1.5rem;
  }
  
  .confirmation-modal__question {
    font-size: 1.1rem;
  }
  
  .confirmation-modal__actions {
    flex-direction: column;
  }
}
</style> 