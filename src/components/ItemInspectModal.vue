<template>
  <Teleport to="body">
    <div v-if="isOpen" class="item-inspect-modal">
      <div class="item-inspect-modal__backdrop" @click="close"></div>
      
      <div class="item-inspect-modal__content">
        <button class="item-inspect-modal__close" @click="close">×</button>
        
        <!-- Item view -->
        <div v-if="!showResults" class="item-modal-view">
          <div class="item-inspect-modal__header">
            <h2 class="item-inspect-modal__title">{{ item.name }}</h2>
            <div class="item-inspect-modal__level">Level {{ item.level }} Item</div>
          </div>
          
          <div class="item-inspect-modal__body">
            <!-- Effect description -->
            <div class="item-inspect-modal__effect">
              <h3>Effect</h3>
              <p>{{ item.effectDescription || getPowerDescription(item.power) }}</p>
              <p v-if="getTargetDescription(item)" class="item-inspect-modal__targeting">
                <span class="targeting-label">Targeting:</span> {{ getTargetDescription(item) }}
              </p>
            </div>

            <!-- Item description (if available) -->
            <div v-if="item.description" class="item-inspect-modal__description">
              <h3>Description</h3>
              <p>{{ item.description }}</p>
            </div>
            
            <!-- Uses counter -->
            <div class="item-inspect-modal__uses">
              <h3>Remaining Uses</h3>
              <p class="uses-count">{{ item.uses }}</p>
            </div>
            
            <!-- Targeting UI (if needed) -->
            <div v-if="showTargetUI" class="item-inspect-modal__targeting-ui">
              <h3>Select Target</h3>
              <div class="target-options">
                <!-- Placeholder for target selection UI -->
                <p class="placeholder-message">Target selection UI will appear here when item is used.</p>
              </div>
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
        
        <!-- Results view after item use -->
        <div v-else class="item-results-view">
          <div class="item-inspect-modal__header">
            <h2 class="item-inspect-modal__title">Item Used</h2>
          </div>
          
          <div class="item-inspect-modal__body">
            <div class="results-content">
              <h3>{{ resultsTitle }}</h3>
              <p>{{ resultsMessage }}</p>
              
              <!-- Optional visual result can be shown here -->
              <div v-if="showVisualResult" class="visual-result">
                <div class="effect-animation">
                  <div class="effect-circle"></div>
                  <div class="effect-rays"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="item-inspect-modal__footer">
            <button 
              class="item-inspect-modal__close-btn"
              @click="close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'
import type { Item } from '../types/item'
import { getTargetDescription } from '../helpers/generateEffectDescription'

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

// State
const showResults = ref(false)
const resultsTitle = ref('Item Effect Applied')
const resultsMessage = ref('')
const showVisualResult = ref(false)
const showTargetUI = ref(false)

// Computed properties
const showUseButton = computed(() => {
  // Only show use button in inventory context
  return props.context === 'inventory'
})

// Helper function to get a human-readable description of a power
function getPowerDescription(power: string): string {
  const descriptions: Record<string, string> = {
    'kill': 'Instantly defeats a target monster.',
    'transmute': 'Transforms a monster into a different form.',
    'scout_500': 'Reveals locations within 500 meters.',
    'scout_1000': 'Reveals locations within 1000 meters.',
    'scout_any': 'Reveals any location on the map.',
    'shrink': 'Reduces a monster\'s level (boss→elite→grunt→minion).',
    'split': 'Splits one monster into multiple lower-level monsters.',
    'pickpocket': 'Steals an item from a monster without defeating it.',
    'banish': 'Removes a monster without getting any loot.'
  }
  
  return descriptions[power] || 'Unknown power'
}

// Methods
function close() {
  // Reset state when closing
  showResults.value = false
  resultsTitle.value = 'Item Effect Applied'
  resultsMessage.value = ''
  showVisualResult.value = false
  showTargetUI.value = false
  
  emit('close')
}

function useItem() {
  // For demo purposes, we'll show the results UI with a random message
  // In a real implementation, this would trigger the actual item use logic first
  
  const resultMessages = [
    "You used the item successfully! The monster falls to the ground, defeated.",
    "The item glows brightly as its power is unleashed.",
    "A flash of magical energy surrounds your target. It's super effective!",
    "The item crumbles to dust as its power is expended.",
    "The magical energy swirls around you before striking the target with precision."
  ]
  
  // Set random result message
  resultsTitle.value = `${props.item.name} Used!`
  resultsMessage.value = resultMessages[Math.floor(Math.random() * resultMessages.length)]
  showVisualResult.value = Math.random() > 0.5
  
  // Show results view
  showResults.value = true
  
  // In a real implementation, you would emit the use event
  emit('use', props.item)
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
  margin: 0 0 5px 0;
  font-size: 1.6rem;
  color: #333;
}

.item-inspect-modal__level {
  font-size: 0.9rem;
  color: #666;
}

.item-inspect-modal__body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.item-inspect-modal__effect,
.item-inspect-modal__description,
.item-inspect-modal__uses,
.item-inspect-modal__targeting-ui,
.results-content {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.item-inspect-modal__effect h3,
.item-inspect-modal__description h3,
.item-inspect-modal__uses h3,
.item-inspect-modal__targeting-ui h3,
.results-content h3 {
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

.targeting-label {
  font-weight: bold;
}

.uses-count {
  font-size: 1.8rem;
  font-weight: bold;
  color: #4a8;
  text-align: center;
}

.item-inspect-modal__footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.item-inspect-modal__use-btn,
.item-inspect-modal__close-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item-inspect-modal__use-btn {
  background-color: #4a8;
  color: white;
}

.item-inspect-modal__use-btn:hover {
  background-color: #3a7;
}

.item-inspect-modal__close-btn {
  background-color: #666;
  color: white;
}

.item-inspect-modal__close-btn:hover {
  background-color: #555;
}

.target-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.placeholder-message {
  color: #999;
  font-style: italic;
  text-align: center;
}

.visual-result {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.effect-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 20px 0;
}

.effect-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4a8;
  opacity: 0.8;
  animation: pulse 2s infinite ease-in-out;
}

.effect-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(74, 136, 128, 0.6) 0%, rgba(74, 136, 128, 0) 70%);
  animation: glow 3s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
}

@keyframes glow {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
}
</style> 