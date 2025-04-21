<template>
  <Teleport to="body">
    <div v-if="isOpen" class="interface-modal">
      <div class="interface-modal__backdrop" :style="backdropStyle" @click="close"></div>
      
      <div class="interface-modal__content" :style="modalContentStyle">
        <div class="interface-modal__header" :style="headerStyle">
          <div class="interface-modal__tabs">
            <button-input
              v-for="tab in tabs" 
              :key="tab.id"
              class="interface-modal__tab"
              :class="{ 'interface-modal__tab--active': activeTab === tab.id }"
              :disabled="tab.disabled"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button-input>
          </div>
          
          <button-input class="interface-modal__close" @click="close">
            ×
          </button-input>
        </div>
        
        <div class="interface-modal__body" :style="bodyStyle">
          <!-- Items Tab -->
          <div v-if="activeTab === 'items'" class="interface-tab interface-tab--items">
            <div v-if="!hasItems" class="interface-tab__empty" :style="emptyMessageStyle">
              Your inventory is empty.
            </div>
            <div v-else class="interface-grid">
              <div 
                v-for="item in inventoryItems" 
                :key="item.id"
                class="interface-grid__item"
              >
                <ItemCard 
                  :item="item"
                  variant="inventory"
                />
              </div>
            </div>
          </div>
          
          <!-- Quest Tab -->
          <div v-else-if="activeTab === 'quest'" class="interface-tab interface-tab--quest">
            <h2>Current Quest</h2>
            
            <div class="quest-details">
              <div class="quest-title" :style="titleStyle">{{ questStore.title }}</div>
              <div class="quest-description" :style="descriptionStyle">{{ questStore.description }}</div>
              
              <div class="quest-stats" :style="statsStyle">
                <div class="stat-group">
                  <div class="stat-label">Experience Points:</div>
                  <div class="stat-value">{{ questStore.xp }}</div>
                </div>
                
                <div class="stat-group">
                  <div class="stat-label">Approximate Alcohol Units:</div>
                  <div class="stat-value">{{ formatUnits(questStore.booze) }}</div>
                </div>
                
                <div class="stat-group">
                  <div class="stat-label">Approximate Soft Drinks:</div>
                  <div class="stat-value">{{ formatUnits(questStore.soft) }}</div>
                </div>
                
                <div class="stat-group">
                  <div class="stat-label">Approximate Player Count:</div>
                  <div class="stat-value">{{ questStore.playerCount }}</div>
                </div>
              </div>
              
              <div class="quest-locations" :style="locationsStyle">
                <div class="location">
                  <div class="location-label">Start GameLocation:</div>
                  <div class="location-value">{{ questStore.startGameLocation?.name || 'Unknown' }}</div>
                </div>
                
                <div class="location">
                  <div class="location-label">Current GameLocation:</div>
                  <div class="location-value">{{ questStore.currentGameLocation?.name || 'Not in a location' }}</div>
                </div>
                
                <div class="location">
                  <div class="location-label">Final GameLocation:</div>
                  <div class="location-value">{{ questStore.endGameLocation?.name || 'Unknown' }}</div>
                </div>
              </div>

            </div>

            <MonsterTypeStats v-if="isDebugMode"/>
          </div>
          
          <!-- Log Tab (disabled for now) -->
          <div v-else-if="activeTab === 'log'" class="interface-tab interface-tab--log">
            <h2>Quest Log</h2>
            <p>Your quest log will be displayed here in a future update.</p>
          </div>
          
          <!-- Options Tab -->
          <div v-else-if="activeTab === 'options'" class="interface-tab interface-tab--options">
            <h2>Game Options</h2>
            
            <div class="options-section">
              <h3>Theme Settings</h3>
              <div class="theme-option">
                <span class="option-label">Theme:</span>
                <div class="theme-buttons">
                  <ButtonInput
                    @click="toggleTheme" 
                    variant="secondary"
                    size="small"
                  >
                    {{ questStore.theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode' }}
                  </ButtonInput>
                </div>
              </div>
            </div>
            
            <div class="options-section">
              <h3>Game Controls</h3>
              <button-input class="quit-button" @click="handleQuit">
                Quit Game
              </button-input>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useInventoryStore} from '../stores/inventoryStore'
import {useAppStore} from '../stores/appStore'
import {useQuestStore} from '../stores/questStore'
import ItemCard from './ItemCard.vue'
import MonsterTypeStats from "@/components/MonsterTypeStats.vue"
import ButtonInput from "@/components/forms/ButtonInput.vue"

// Stores
const inventoryStore = useInventoryStore()
const appStore = useAppStore()
const questStore = useQuestStore()

// Debug mode is determined by URL hash
const isDebugMode = ref(window.location.hash === '#DEBUG');

// Listen for hash changes to update debug mode status
window.addEventListener('hashchange', () => {
  isDebugMode.value = window.location.hash === '#DEBUG';
});

const isOpen = computed(()=>appStore.isInterfaceOpen)

// Computed
const activeTab = computed({
  get: () => appStore.inventoryTab,
  set: (value) => appStore.setInventoryTab(value)
})
const hasItems = computed(() => inventoryStore.hasItems)
const inventoryItems = computed(() => {
  return [...inventoryStore.items].sort((a, b) => {
    // First by timestamp (newest first)
    if (a.timestamp && b.timestamp) {
      return b.timestamp - a.timestamp
    } else if (a.timestamp) {
      return -1 // a is newer (has timestamp)
    } else if (b.timestamp) {
      return 1  // b is newer (has timestamp)
    }
    
    // Then by level descending
    if (b.level !== a.level) {
      return b.level - a.level
    }
    // Then by name ascending
    return a.name.localeCompare(b.name)
  })
})

// Tabs
const tabs = [
  { id: 'items', label: 'Items', disabled: false },
  { id: 'quest', label: 'Quest', disabled: false },
  { id: 'log', label: 'Log', disabled: true },
  { id: 'options', label: 'Options', disabled: false }
]

// Theme-based styles
const backdropStyle = computed(() => ({
  backgroundColor: questStore.getOverlayColors().background,
}))

const modalContentStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('modal'),
  color: questStore.getTextColor('primary'),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
}))

const headerStyle = computed(() => ({
  borderBottom: `1px solid ${questStore.getBorderColor('light')}`,
}))

const bodyStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

const emptyMessageStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))

const titleStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

const descriptionStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))

const statsStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light'),
}))

const locationsStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light'),
}))

// Methods
function close() {
  appStore.closeInterface()
}

function handleQuit() {
  appStore.setScreen('start_quest')
  appStore.closeInterface()
}

function toggleTheme() {
  questStore.toggleTheme()
}

// Helper function to format booze without decimal for whole numbers
function formatUnits(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
}
</script>

<style scoped>
.interface-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.interface-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(2px);
}

.interface-modal__content {
  position: relative;
  width: 90%;
  height: 90%;
  max-width: 1200px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.interface-modal__header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interface-modal__tabs {
  display: flex;
  gap: 0.5rem;
}

.interface-modal__tab {
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.interface-modal__close {
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}

.interface-modal__body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.interface-tab {
  height: 100%;
}

.interface-tab h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
}

.interface-tab h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
}

.interface-tab__empty {
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

.interface-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.interface-grid__item {
  margin-bottom: 1rem;
}

.quest-details {
  max-width: 800px;
  margin: 0 auto;
}

.quest-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.quest-description {
  margin-bottom: 2rem;
  font-style: italic;
  text-align: center;
}

.quest-stats, .quest-locations {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.stat-group, .location {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}

.stat-group:not(:last-child), .location:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label, .location-label {
  font-weight: 500;
}

.options-section {
  margin-bottom: 2rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.option-label {
  min-width: 100px;
  font-weight: 500;
}

.theme-buttons {
  display: flex;
  gap: 0.5rem;
}

.quit-button {
  margin-top: 1rem;
}

/* Media queries for responsive design */
@media screen and (max-width: 767px) {
  .interface-modal__content {
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .interface-modal__header {
    padding: 0.75rem;
  }
  
  .interface-modal__tabs {
    gap: 0.3rem;
  }
  
  .interface-modal__tab {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }
  
  .interface-modal__body {
    padding: 0.75rem;
  }
  
  .interface-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
    padding: 0.5rem;
  }
}
</style> 