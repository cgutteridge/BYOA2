<template>
  <Teleport to="body">
    <div v-if="isOpen" class="item-inspect-modal">
      <div class="item-inspect-modal__backdrop" @click="close"></div>
      
      <div class="item-inspect-modal__content" :class="[`theme-${currentTheme}`]">
        <button class="item-inspect-modal__close" @click="close">×</button>
        
        <div class="theme-toggle">
          <button 
            @click="toggleTheme" 
            class="theme-button"
          >
            {{ currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode' }}
          </button>
        </div>
        
        <!-- Item view -->
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
              <p>{{ power.generateEffectDescription(item) }}</p>
            </div>
            
            <!-- Target selection (when in location) -->
            <div v-if="isInGameLocation && (item.power === 'kill' || item.power === 'transmute' || item.power === 'shrink' || item.power === 'split' || item.power === 'pickpocket' || item.power === 'banish' || item.power === 'freeze' || item.power === 'petrify' || item.power === 'pacify' || item.power === 'distract' || item.power === 'vegetate' || item.power === 'stun')" class="item-inspect-modal__target-section">
              <h3>{{ isChoiceTarget ? 'Choose Target' : 'Possible Targets' }}</h3>
              <p class="target-description">{{ power.getTargetDescription(item) }}</p>
              
              <div v-if="hasTargetableMonsters" class="target-list">
                <div v-if="targetMode === 'type'" class="target-type-list">
                  <ListInput
                    v-model="selectedTargetTypes"
                    :options="potentialTargetMonsterTypes.map(type => ({
                      id: type,
                      name: getMonsterTitle(type),
                      count: getMonsterCountByType(type)
                    }))"
                    :multiple="true"
                    :max-selections="item.uses || 1"
                    :always-show="true"
                    :disabled="!isChoiceTarget"
                    :theme="currentTheme"
                  />
                </div>
                <div v-else class="target-monster-list">
                  <ListInput
                    v-model="selectedTargets"
                    :options="potentialTargetMonsters.map(monster => ({
                      id: monster.id,
                      name: monster.name,
                      subtitle: `${getMonsterSpecies(monster.type)} ${getMonsterLevel(monster.type)}`
                    }))"
                    :multiple="true"
                    :max-selections="item.uses || 1"
                    :always-show="true"
                    :disabled="!isChoiceTarget"
                    :theme="currentTheme"
                  />
                </div>
              </div>
              
              <p v-else class="no-targets">
                No valid targets available for this item in current location.
              </p>
            </div>
            
            <!-- Result selection for transmute -->
            <div v-if="isInGameLocation && item.power === 'transmute'" class="item-inspect-modal__result-section">
              <h3>{{ item.result === 'pick' ? 'Choose Result' : 'Possible Results' }}</h3>
              
              <div class="result-list">
                <ListInput
                  v-model="selectedResult"
                  :options="possibleResults"
                  :always-show="true"
                  :disabled="item.result !== 'pick'"
                  :theme="currentTheme"
                />
                
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
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {Item, Monster, MonsterTypeId, toMonsterTypeId} from '../types'
import {useAppStore} from '../stores/appStore'
import {useQuestStore} from '../stores/questStore'
import {getValidTargets} from '../quest/itemUtils.ts'
import {getMonsterLevel, getMonsterSpecies, getUniqueMonsterTypes} from '../quest/monsterUtils.ts'
import {monsterTypes} from '../data/monsterTypes.ts'
import {powerFactory} from "@/powers";
import pickOne from "@/utils/pickOne.ts";
import ListInput from './forms/ListInput.vue'

// Stores
const appStore = useAppStore()
const questStore = useQuestStore()

// Get modal state from appStore
const isOpen = computed(() => appStore.inspectedItem !== null)
const item = computed(() => appStore.inspectedItem || {} as Item)

const power = computed(()=> powerFactory.getPower(item.value.power))

// Determine context based on app state
const context = computed(() => {
  const hasCurrentGameLocation = !!questStore.currentGameLocation
  const isInventoryOpen = appStore.isInterfaceOpen
  
  if (hasCurrentGameLocation && isInventoryOpen) return 'inventory_in_location'
  if (hasCurrentGameLocation && !isInventoryOpen) return 'item_in_location'
  if (!hasCurrentGameLocation && isInventoryOpen) return 'inventory'
  return 'item'
})

// State
const selectedTargets = ref<string[]>([])
const selectedTargetTypes = ref<string[]>([])
const selectedResult = ref<string>('')
const currentTheme = ref<'light' | 'dark'>('light') // Default theme with proper type

// Toggle between light and dark themes
function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}

// Computed properties
const showUseButton = computed(() => {
  // Only show use button in inventory contexts
  return context.value === 'inventory' || context.value === 'inventory_in_location'
})

const isInGameLocation = computed(() => {
  // Check if the player is in a location (any context with "location")
  return context.value === 'inventory_in_location' || context.value === 'item_in_location'
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
const potentialTargetMonsters = computed(() => {
  if (!questStore.currentGameLocation?.monsters) return []
  return getValidTargets(item.value, questStore.currentGameLocation.monsters) as Monster[]
})

const potentialTargetMonsterTypes = computed(() => {
  return getUniqueMonsterTypes(potentialTargetMonsters.value)
})

const hasTargetableMonsters = computed(() => {
  if (!item.value) return false

  return potentialTargetMonsters.value.length > 0 || potentialTargetMonsterTypes.value.length > 0
})

const possibleResults = computed(() => {
  // For transmute, determine possible result types
  if (item.value.power !== 'transmute') return []
  
  // Could be fetched from a data source; using placeholder for now
  return ['ghost', 'vampire', 'human', 'goblinoid', 'demonoid', 'elemental']
})

const isUseButtonDisabled = computed(() => {
  if (!isInGameLocation.value) return false
  
  // For powers that need targets
  if (['kill', 'transmute', 'shrink', 'split', 'pickpocket', 'banish', 'freeze', 'petrify', 'pacify', 'distract', 'vegetate', 'stun'].includes(item.value.power || '')) {
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
  // Count monsters of the exact type
  const monsters : Monster[] = questStore.currentGameLocation?.monsters || []
  return monsters.filter(monster => monster.type === type && monster.alive).length
}

// Methods
function close() {
  // Reset state when closing
  selectedTargets.value = []
  selectedTargetTypes.value = []
  selectedResult.value = ''
  
  // Use appStore to close modal
  appStore.closeItemInspectModal()
}

function useItem(): void {
  const power = powerFactory.getPower(item.value.power);

  if (item.value.target === 'pick' || item.value.target === 'random') {
    let targets: Monster[] = []
    if (item.value.target === 'pick') {
      console.log({v: selectedTargets.value})
      targets = selectedTargets.value.map(monsterId => potentialTargetMonsters.value.find(monster => monster.id === monsterId) as Monster)
    } else {
      targets = [pickOne(potentialTargetMonsters.value)]
    }
    targets.forEach(monster => {
      power.useOnMonster(item.value, monster)
    })
  } else { // type (pick_type or random_type)
    let targets: MonsterTypeId[] = []
    if (item.value.target === 'pick_type') {
      targets = selectedTargetTypes.value.map(toMonsterTypeId)
    } else {
      targets = [toMonsterTypeId(pickOne(potentialTargetMonsterTypes.value))]
    }
    targets.forEach(monsterType => {
      power.useOnType(item.value, monsterType)
    })
  }

  close()
  appStore.closeInterface()
}

// Add this function to get monster title
function getMonsterTitle(typeId: string): string {
  const monsterType = monsterTypes.find(mt => mt.id === typeId)
  return monsterType ? monsterType.title : typeId.charAt(0).toUpperCase() + typeId.slice(1).replace(/_/g, ' ')
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
  text-align: center;
}

.theme-toggle {
  margin: 10px 0;
  display: flex;
  justify-content: center;
}

.theme-button {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

/* Light theme styles */
.theme-light {
  background-color: #fff;
  color: #333333;
}

.theme-light .theme-button {
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  color: #333;
}

.theme-light .theme-button:hover {
  background: #e0e0e0;
}

.theme-light .item-inspect-modal__header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.theme-light .item-inspect-modal__effect,
.theme-light .item-inspect-modal__description,
.theme-light .item-inspect-modal__target-section,
.theme-light .item-inspect-modal__result-section,
.theme-light .results-content {
  background-color: #f5f5f5;
  border: 1px solid #eee;
}

.theme-light .target-description {
  color: #555;
}

.theme-light .no-targets, 
.theme-light .no-results {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

/* Dark theme styles */
.theme-dark {
  background-color: #222;
  color: #f0f0f0;
}

.theme-dark .theme-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.theme-dark .theme-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.theme-dark .item-inspect-modal__header {
  background-color: #333;
  border-bottom: 1px solid #444;
}

.theme-dark .item-inspect-modal__title {
  color: #f0f0f0;
}

.theme-dark .item-inspect-modal__level {
  color: #ccc;
}

.theme-dark .item-inspect-modal__effect,
.theme-dark .item-inspect-modal__description,
.theme-dark .item-inspect-modal__target-section,
.theme-dark .item-inspect-modal__result-section,
.theme-dark .results-content {
  background-color: #333;
  border: 1px solid #444;
}

.theme-dark .item-inspect-modal__effect h3,
.theme-dark .item-inspect-modal__description h3,
.theme-dark .item-inspect-modal__target-section h3,
.theme-dark .item-inspect-modal__result-section h3,
.theme-dark .results-content h3 {
  color: #f0f0f0;
}

.theme-dark .item-inspect-modal__effect p,
.theme-dark .item-inspect-modal__description p,
.theme-dark .item-modal-view p,
.theme-dark .item-results-view p {
  color: #f0f0f0;
}

.theme-dark .target-description {
  color: #ccc;
}

.theme-dark .no-targets, 
.theme-dark .no-results {
  background: rgba(255, 255, 255, 0.05);
  color: #ccc;
}

.theme-dark .item-inspect-modal__footer {
  background-color: #333;
  border-top: 1px solid #444;
}

/* Shared styles */
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
  position: sticky;
  top: 0;
  z-index: 5;
}

.item-inspect-modal__title {
  margin: 0 0 5px 0;
  font-size: 1.6rem;
  text-align: center;
}

.item-inspect-modal__level {
  font-size: 0.9rem;
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
  display: flex;
  justify-content: center;
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
  background-color: #43A047;
  color: white;
}

.item-inspect-modal__use-btn:hover,
.item-inspect-modal__close-btn:hover {
  background-color: #2E7D32;
}

.item-inspect-modal__use-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.item-inspect-modal__close-btn {
  background-color: #757575;
  color: white;
}

.item-inspect-modal__close-btn:hover {
  background-color: #616161;
}

.target-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

/* Target selection styles */
.target-list, .result-list {
  margin: 0.5rem 0;
  border-radius: 8px;
  padding-bottom: 1rem;  /* Add padding to create space below the list */
}

.target-description {
  margin-bottom: 1rem;
  font-style: italic;
  font-size: 0.9rem;
}

.no-targets, .no-results {
  padding: 1rem;
  border-radius: 8px;
  margin: 0.5rem 0;
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

/* Mobile full screen styles */
@media screen and (max-width: 767px) {
  .item-inspect-modal__content {
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .item-inspect-modal__header {
    padding: 15px 10px;
  }
  
  .item-inspect-modal__body {
    padding: 15px 10px;
  }
  
  .item-inspect-modal__title {
    font-size: 1.4rem;
  }
}
</style> 