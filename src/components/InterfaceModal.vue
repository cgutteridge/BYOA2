<template>
  <Teleport to="body">
    <div v-if="isOpen" class="interface-modal">
      <div class="interface-modal__backdrop" @click="close"></div>
      
      <div class="interface-modal__content">
        <div class="interface-modal__header">
          <div class="interface-modal__tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              class="interface-modal__tab"
              :class="{ 'interface-modal__tab--active': activeTab === tab.id }"
              :disabled="tab.disabled"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <button class="interface-modal__close" @click="close">
            ×
          </button>
        </div>
        
        <div class="interface-modal__body">
          <!-- Items Tab -->
          <div v-if="activeTab === 'items'" class="interface-tab interface-tab--items">
            <div v-if="!hasItems" class="interface-tab__empty">
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
              <div class="quest-title">{{ questStore.title }}</div>
              <div class="quest-description">{{ questStore.description }}</div>
              
              <div class="quest-stats">
                <div class="stat-group">
                  <div class="stat-label">Experience Points:</div>
                  <div class="stat-value">{{ questStore.xp }}</div>
                </div>
                
                <div class="stat-group">
                  <div class="stat-label">Alcohol Units:</div>
                  <div class="stat-value">{{ formatUnits(questStore.booze) }}</div>
                </div>
                
                <div class="stat-group">
                  <div class="stat-label">Player Count:</div>
                  <div class="stat-value">{{ questStore.playerCount }}</div>
                </div>
              </div>
              
              <div class="quest-locations">
                <div class="location">
                  <div class="location-label">Start Location:</div>
                  <div class="location-value">{{ questStore.startPub?.name || 'Unknown' }}</div>
                </div>
                
                <div class="location">
                  <div class="location-label">Current Location:</div>
                  <div class="location-value">{{ questStore.currentPub?.name || 'Not in a location' }}</div>
                </div>
                
                <div class="location">
                  <div class="location-label">Target Location:</div>
                  <div class="location-value">{{ questStore.endPub?.name || 'Unknown' }}</div>
                </div>
              </div>
            </div>
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
              <h3>Game Controls</h3>
              <button class="quit-button" @click="handleQuit">
                Quit Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '../stores/inventoryStore'
import { useAppStore } from '../stores/appStore'
import { useQuestStore } from '../stores/questStore'
import ItemCard from './ItemCard.vue'

// Stores
const inventoryStore = useInventoryStore()
const appStore = useAppStore()
const questStore = useQuestStore()

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

// Methods
function close() {
  appStore.closeInventory()
}

function handleQuit() {
  appStore.setScreen('start_quest')
  appStore.closeInventory()
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
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.interface-modal__content {
  position: relative;
  width: 90%;
  height: 90%;
  max-width: 1200px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.interface-modal__header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
}

.interface-modal__tabs {
  display: flex;
  gap: 1px;
}

.interface-modal__tab {
  padding: 8px 16px;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.interface-modal__tab:hover:not(:disabled) {
  background-color: #eaeaea;
}

.interface-modal__tab--active {
  color: #4a8;
  font-weight: 600;
}

.interface-modal__tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -16px;
  height: 3px;
  background-color: #4a8;
  border-radius: 3px 3px 0 0;
}

.interface-modal__tab:disabled {
  color: #aaa;
  cursor: not-allowed;
}

.interface-modal__close {
  border: none;
  background: transparent;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  padding: 0 8px;
  color: #666;
}

.interface-modal__close:hover {
  color: #333;
}

.interface-modal__body {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

.interface-tab__empty {
  text-align: center;
  padding: 40px;
  color: #888;
  font-style: italic;
}

.interface-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.options-section {
  margin-top: 24px;
}

.quit-button {
  background-color: #e55;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quit-button:hover {
  background-color: #d44;
}

.quest-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.quest-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.quest-description {
  font-style: italic;
  color: #555;
  line-height: 1.4;
}

.quest-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stat-group {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.stat-label {
  font-weight: bold;
  color: #555;
}

.stat-value {
  color: #333;
  font-weight: 600;
}

.quest-locations {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.location {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.location-label {
  font-weight: bold;
  color: #555;
}

.location-value {
  color: #333;
  font-weight: 600;
}
</style> 