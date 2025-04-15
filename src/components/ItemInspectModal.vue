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
            <div class="item-inspect-modal__level">{{ item.uses !== undefined ? `${item.uses} use${item.uses!=1?"s":""} remaining` : 'Unlimited uses' }}</div>
          </div>
          
          <div class="item-inspect-modal__body">
            <!-- Item description (if available) -->
            <div v-if="item.description" class="item-inspect-modal__description">
              <p>{{ item.description }}</p>
            </div>
            
            <!-- Effect description -->
            <div class="item-inspect-modal__effect">
              <p>{{ generateEffectDescription(item) }}</p>
            </div>
            
            <!-- Target selection (when in pub) -->
            <div v-if="isInPub && (item.power === 'kill' || item.power === 'transmute' || item.power === 'shrink' || item.power === 'split' || item.power === 'pickpocket' || item.power === 'banish')" class="item-inspect-modal__target-section">
              <h3>{{ isChoiceTarget ? 'Choose Target' : 'Possible Targets' }}</h3>
              <p class="target-description">{{ getTargetDescription(item) }}</p>
              
              <div v-if="hasTargetableMonsters" class="target-list">
                <div v-if="targetMode === 'type'" class="target-type-list">
                  <div 
                    v-for="(type, index) in availableMonsterTypes" 
                    :key="index"
                    class="target-type-item"
                    :class="{ 'target-selected': selectedTargetTypes.includes(type) }"
                    @click="isChoiceTarget ? toggleTargetType(type) : null"
                  >
                    {{ type.charAt(0).toUpperCase() + type.slice(1) }} ({{ getMonsterCountByType(type) }})
                  </div>
                </div>
                <div v-else class="target-monster-list">
                  <div 
                    v-for="monster in availableMonsters" 
                    :key="monster.id"
                    class="target-monster-item"
                    :class="{ 'target-selected': selectedTargets.includes(monster.id) }"
                    @click="isChoiceTarget ? toggleTarget(monster.id) : null"
                  >
                    {{ monster.name }} ({{ getMonsterSpecies(monster.type) }} {{ getMonsterLevel(monster.type) }})
                  </div>
                </div>
              </div>
              
              <p v-else class="no-targets">
                No valid targets available for this item in current location.
              </p>
            </div>
            
            <!-- Result selection for transmute -->
            <div v-if="isInPub && item.power === 'transmute'" class="item-inspect-modal__result-section">
              <h3>{{ item.result === 'pick' ? 'Choose Result' : 'Possible Results' }}</h3>
              
              <div class="result-list">
                <div 
                  v-for="(result, index) in possibleResults" 
                  :key="index"
                  class="result-item"
                  :class="{ 'result-selected': selectedResult === result }"
                  @click="item.result === 'pick' ? selectResult(result) : null"
                >
                  {{ result }}
                </div>
                
                <p v-if="possibleResults.length === 0" class="no-results">
                  No possible results available
                </p>
              </div>
            </div>
          </div>
          
          <div class="item-inspect-modal__footer">
            <button 
              v-if="showUseButton && item.power && (item.uses === undefined || item.uses > 0)"
              :disabled="isUseButtonDisabled"
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
import { ref, computed } from 'vue'
import type { Item } from '../types/item'
import type { Monster } from '../types'
import { getTargetDescription, generateEffectDescription } from '../quest/generateEffectDescription.ts'
import { useAppStore } from '../stores/appStore'
import { useQuestStore } from '../stores/questStore'
import { getValidTargets } from '../powers'
import { 
  getUniqueMonsterSpecies, 
  getMonsterCountBySpecies, 
  getMonsterLevel, 
  getMonsterSpecies 
} from '../quest/targeting.ts'

// Stores
const appStore = useAppStore()
const questStore = useQuestStore()

// Get modal state from appStore
const isOpen = computed(() => appStore.inspectedItem !== null)
const item = computed(() => appStore.inspectedItem || {} as Item)

// Determine context based on app state
const context = computed(() => {
  const hasCurrentLocation = !!questStore.currentPub
  const isInventoryOpen = appStore.isInterfaceOpen
  
  if (hasCurrentLocation && isInventoryOpen) return 'inventory_in_pub'
  if (hasCurrentLocation && !isInventoryOpen) return 'item_in_pub'
  if (!hasCurrentLocation && isInventoryOpen) return 'inventory'
  return 'item'
})

// State
const showResults = ref(false)
const resultsTitle = ref('Item Effect Applied')
const resultsMessage = ref('')
const showVisualResult = ref(false)
const selectedTargets = ref<string[]>([])
const selectedTargetTypes = ref<string[]>([])
const selectedResult = ref<string>('')

// Computed properties
const showUseButton = computed(() => {
  // Only show use button in inventory contexts
  return context.value === 'inventory' || context.value === 'inventory_in_pub'
})

const isInPub = computed(() => {
  // Check if the player is in a pub (any context with "pub")
  return context.value === 'inventory_in_pub' || context.value === 'item_in_pub'
})

const targetMode = computed(() => {
  // Determine if we're targeting individual monsters or monster types
  if (item.value.target === 'random_type' || item.value.target === 'pick_type') {
    return 'type'
  }
  return 'individual'
})

const isChoiceTarget = computed(() => {
  // Determine if this is a choice-based target selection
  return item.value.target === 'pick' || item.value.target === 'pick_type'
})

// Use the powers helper function to get valid targets
const availableMonsters = computed(() => {
  if (!questStore.currentPub?.monsters) return []
  return getValidTargets(item.value, questStore.currentPub.monsters) as Monster[]
})

const availableMonsterTypes = computed(() => {
  // Get unique monster species from available monsters
  return getUniqueMonsterSpecies(availableMonsters.value)
})

const hasTargetableMonsters = computed(() => {
  if (!item.value) return false
  
  return availableMonsters.value.length > 0 || availableMonsterTypes.value.length > 0
})

const possibleResults = computed(() => {
  // For transmute, determine possible result types
  if (item.value.power !== 'transmute') return []
  
  // Could be fetched from a data source; using placeholder for now
  return ['ghost', 'vampire', 'human', 'goblinoid', 'demonoid', 'elemental']
})

const isUseButtonDisabled = computed(() => {
  if (!isInPub.value) return false
  
  // For powers that need targets
  if (['kill', 'transmute', 'shrink', 'split', 'pickpocket', 'banish'].includes(item.value.power || '')) {
    // Choice-based targeting requires selection
    if (isChoiceTarget.value) {
      if (targetMode.value === 'type') {
        if (selectedTargetTypes.value.length === 0) return true
      } else {
        if (selectedTargets.value.length === 0) return true
      }
    }
    
    // No valid targets available
    if (!hasTargetableMonsters.value) return true
  }
  
  // For transmute with pick result
  if (item.value.power === 'transmute' && item.value.result === 'pick') {
    if (!selectedResult.value) return true
  }
  
  return false
})

// Helper function to get monster count by type
function getMonsterCountByType(type: string): number {
  return getMonsterCountBySpecies(availableMonsters.value, type)
}

// Helper function to toggle target selection
function toggleTarget(monsterId: string) {
  const maxSelections = item.value.uses || 1
  const index = selectedTargets.value.indexOf(monsterId)
  
  if (index >= 0) {
    // Deselect
    selectedTargets.value.splice(index, 1)
  } else if (selectedTargets.value.length < maxSelections) {
    // Select if under max
    selectedTargets.value.push(monsterId)
  }
}

// Helper function to toggle target type selection
function toggleTargetType(type: string) {
  const maxSelections = item.value.uses || 1
  const index = selectedTargetTypes.value.indexOf(type)
  
  if (index >= 0) {
    // Deselect
    selectedTargetTypes.value.splice(index, 1)
  } else if (selectedTargetTypes.value.length < maxSelections) {
    // Select if under max
    selectedTargetTypes.value.push(type)
  }
}

// Helper function to select a result
function selectResult(result: string) {
  selectedResult.value = result
}

// Methods
function close() {
  // Reset state when closing
  showResults.value = false
  resultsTitle.value = 'Item Effect Applied'
  resultsMessage.value = ''
  showVisualResult.value = false
  selectedTargets.value = []
  selectedTargetTypes.value = []
  selectedResult.value = ''
  
  // Use appStore to close modal
  appStore.closeItemInspectModal()
}

function useItem() {
  // For demo purposes, we'll show the results UI with a random message
  // In a real implementation, this would use the selected targets
  
  const resultMessages = [
    "You used the item successfully! The monster falls to the ground, defeated.",
    "The item glows brightly as its power is unleashed.",
    "A flash of magical energy surrounds your target. It's super effective!",
    "The item crumbles to dust as its power is expended.",
    "The magical energy swirls around you before striking the target with precision."
  ]
  
  // Set random result message
  resultsTitle.value = `${item.value?.name || 'Item'} Used!`
  resultsMessage.value = resultMessages[Math.floor(Math.random() * resultMessages.length)]
  showVisualResult.value = Math.random() > 0.5
  
  // Show results view
  showResults.value = true
  
  // Use appStore or other store methods to apply item effects
  // This would be implemented in the actual game logic
  // For example: questStore.useItem(item.value, selectedTargets.value)
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
  overflow: hidden;
}

.item-inspect-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.item-inspect-modal__content {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
  text-align: center;
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
  color: #555;
  z-index: 10;
}

.item-inspect-modal__close:hover {
  color: #333;
}

.item-inspect-modal__header {
  padding: 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 5;
}

.item-inspect-modal__title {
  margin: 0 0 5px 0;
  font-size: 1.6rem;
  color: #333;
  text-align: center;
}

.item-inspect-modal__level {
  font-size: 0.9rem;
  color: #555;
  text-align: center;
}

.item-inspect-modal__body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(100vh - 130px); /* Account for header and footer */
  text-align: center;
}

.item-modal-view, .item-results-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-inspect-modal__effect,
.item-inspect-modal__description,
.item-inspect-modal__target-section,
.item-inspect-modal__result-section,
.results-content {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  text-align: center;
}

.item-inspect-modal__effect h3,
.item-inspect-modal__description h3,
.item-inspect-modal__target-section h3,
.item-inspect-modal__result-section h3,
.results-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.2rem;
}

.item-inspect-modal__effect p,
.item-inspect-modal__description p,
.item-modal-view p,
.item-results-view p {
  text-align: center;
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
  color: #555;
  text-align: center;
}

.item-inspect-modal__footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  background-color: #fff;
  position: sticky;
  bottom: 0;
  z-index: 5;
}

.item-inspect-modal__use-btn,
.item-inspect-modal__close-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #555;
  color: white;
}

.item-inspect-modal__use-btn:hover,
.item-inspect-modal__close-btn:hover {
  background-color: #444;
}

.item-inspect-modal__use-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.item-inspect-modal__use-btn {
  background-color: #555;
  color: white;
}

.item-inspect-modal__close-btn {
  background-color: #555;
  color: white;
}

.item-inspect-modal__close-btn:hover {
  background-color: #444;
}

.target-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.placeholder-message {
  color: #777;
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
  background-color: #555;
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
  background: radial-gradient(circle, rgba(85, 85, 85, 0.6) 0%, rgba(85, 85, 85, 0) 70%);
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

/* New target selection styles */
.item-inspect-modal__target-section,
.item-inspect-modal__result-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.target-description {
  font-style: italic;
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
  margin-bottom: 12px;
}

.target-list,
.result-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.target-monster-item,
.target-type-item,
.result-item {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
}

.target-monster-item:hover,
.target-type-item:hover,
.result-item:hover {
  background-color: #f0f0f0;
}

.target-monster-item:last-child,
.target-type-item:last-child,
.result-item:last-child {
  border-bottom: none;
}

.target-monster-item:active,
.target-type-item:active,
.result-item:active {
  background-color: #e8e8e8;
}

.target-selected,
.result-selected {
  background-color: #f0f0f0;
  border-left: 2px solid #555;
  padding-left: 13px; /* 15px - 2px border */
}

.no-targets,
.no-results {
  text-align: center;
  padding: 20px;
  color: #777;
  font-style: italic;
}

/* Media queries for responsive design */
@media screen and (min-width: 768px) {
  .item-inspect-modal__content {
    width: 90%;
    max-width: 700px;
    height: 90%;
    max-height: 90vh;
    margin: auto;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  .item-inspect-modal__body {
    max-height: calc(90vh - 130px);
  }
}
</style> 