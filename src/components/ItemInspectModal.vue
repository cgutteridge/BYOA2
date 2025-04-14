<template>
  <Teleport to="body">
    <div v-if="isOpen" class="item-inspect-modal">
      <div class="item-inspect-modal__backdrop" @click="close"></div>
      
      <div class="item-inspect-modal__content">
        <button class="item-inspect-modal__close" @click="close">×</button>
        
        <div class="item-inspect-modal__header">
          <h2 class="item-inspect-modal__title">{{ item.name }}</h2>
        </div>
        
        <div class="item-inspect-modal__body">
          <div class="item-inspect-modal__description" v-if="item.description">
            {{ item.description }}
          </div>
          
          <div v-if="item.power" class="item-inspect-modal__power">
            <h3>Effect</h3>
            <p>{{ item.effectDescription || getPowerDescription(item.power) }}</p>
            <p v-if="getTargetDescription(item)" class="item-inspect-modal__targeting">
              {{ getTargetDescription(item) }}
            </p>
          </div>
          
          <div v-if="item.uses !== undefined" class="item-inspect-modal__uses">
            <h3>Remaining Uses</h3>
            <p>{{ item.uses }}</p>
          </div>
        </div>
        
        <div class="item-inspect-modal__footer">
          <button 
            v-if="showUseButton && item.power && (item.uses === undefined || item.uses > 0)" 
            class="item-inspect-modal__use-btn"
            @click="useItem"
          >
            Use Item
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Item } from '../types/item'
import { getTargetDescription } from '../powers'

// Define props
const props = defineProps<{
  isOpen: boolean
  item: Item
  context?: 'inventory' | 'location' | 'reward'
}>()

// Define emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'use', item: Item): void
}>()

// Computed properties
const showUseButton = props.context === 'inventory'

// Helper function to get a human-readable description of a power
function getPowerDescription(power: string): string {
  const descriptions: Record<string, string> = {
    'kill_one': 'Instantly defeats a single target monster.',
    'kill_all': 'Defeats all monsters of a specific type.',
    'transmute_one': 'Transforms a monster into a different form.',
    'transmute_all': 'Transforms all monsters of a type into different forms.',
    'scout_500': 'Reveals locations within 500 meters.',
    'scout_1000': 'Reveals locations within 1000 meters.',
    'scout_any': 'Reveals any location on the map.',
    'shrink': 'Reduces a monster\'s level (boss→elite→grunt→minion).',
    'split': 'Splits one monster into multiple lower-level monsters.',
    'pickpocket': 'Steals an item from a monster without defeating it.'
  }
  
  return descriptions[power] || 'Unknown power'
}

// Methods
function close() {
  emit('close')
}

function useItem() {
  emit('use', props.item)
  close()
}
</script>

<style scoped>
.item-inspect-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-inspect-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.item-inspect-modal__content {
  position: relative;
  width: 90%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 80vh;
}

.item-inspect-modal__close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0 8px;
  color: #666;
  z-index: 1;
}

.item-inspect-modal__close:hover {
  color: #333;
}

.item-inspect-modal__header {
  padding: 20px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.item-inspect-modal__title {
  margin: 0;
  font-size: 1.6rem;
  color: #333;
}

.item-inspect-modal__body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.item-inspect-modal__description {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #444;
  margin-bottom: 20px;
}

.item-inspect-modal__story,
.item-inspect-modal__power,
.item-inspect-modal__uses {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.item-inspect-modal__story h3,
.item-inspect-modal__power h3,
.item-inspect-modal__uses h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.2rem;
}

.item-inspect-modal__targeting {
  font-style: italic;
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
}

.item-inspect-modal__footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.item-inspect-modal__use-btn {
  background-color: #4a8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item-inspect-modal__use-btn:hover {
  background-color: #3a7;
}
</style> 