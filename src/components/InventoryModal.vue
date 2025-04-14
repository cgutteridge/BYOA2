<template>
  <Teleport to="body">
    <div v-if="isOpen" class="inventory-modal">
      <div class="inventory-modal__backdrop" @click="close"></div>
      
      <div class="inventory-modal__content">
        <div class="inventory-modal__header">
          <div class="inventory-modal__tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              class="inventory-modal__tab"
              :class="{ 'inventory-modal__tab--active': activeTab === tab.id }"
              :disabled="tab.disabled"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <button class="inventory-modal__close" @click="close">
            ×
          </button>
        </div>
        
        <div class="inventory-modal__body">
          <!-- Items Tab -->
          <div v-if="activeTab === 'items'" class="inventory-tab inventory-tab--items">
            <div v-if="!hasItems" class="inventory-tab__empty">
              Your inventory is empty.
            </div>
            <div v-else class="inventory-grid">
              <div 
                v-for="item in inventoryItems" 
                :key="item.id"
                class="inventory-grid__item"
              >
                <ItemCard 
                  :item="item"
                  :show-use-button="true"
                  :show-inspect-button="true"
                  :show-quantity="true"
                  @use="handleUseItem(item)"
                  @inspect="handleInspectItem(item)"
                />
              </div>
            </div>
          </div>
          
          <!-- Quest Tab -->
          <div v-else-if="activeTab === 'quest'" class="inventory-tab inventory-tab--quest">
            <h2>Current Quest</h2>
            <p>Quest details will be displayed here in a future update.</p>
          </div>
          
          <!-- Log Tab (disabled for now) -->
          <div v-else-if="activeTab === 'log'" class="inventory-tab inventory-tab--log">
            <h2>Quest Log</h2>
            <p>Your quest log will be displayed here in a future update.</p>
          </div>
          
          <!-- Options Tab -->
          <div v-else-if="activeTab === 'options'" class="inventory-tab inventory-tab--options">
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
import ItemCard from './ItemCard.vue'
import type { Item } from '../types/item'

// Stores
const inventoryStore = useInventoryStore()
const appStore = useAppStore()

// Props
defineProps<{
  isOpen: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'quit'): void
}>()

// Computed
const activeTab = computed({
  get: () => appStore.inventoryTab,
  set: (value) => appStore.setInventoryTab(value)
})
const hasItems = computed(() => inventoryStore.hasItems)
const inventoryItems = computed(() => inventoryStore.items)

// Tabs
const tabs = [
  { id: 'items', label: 'Items', disabled: false },
  { id: 'quest', label: 'Quest', disabled: false },
  { id: 'log', label: 'Log', disabled: true },
  { id: 'options', label: 'Options', disabled: false }
]

// Methods
function close() {
  emit('close')
}

function handleUseItem(item: Item) {
  // This will be implemented in later stages
  console.log('Use item:', item.name)
  inventoryStore.useItem(item.id)
}

function handleInspectItem(item: Item) {
  // This will be implemented in later stages
  console.log('Inspect item:', item.name)
}

function handleQuit() {
  emit('quit')
}
</script>

<style scoped>
.inventory-modal {
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

.inventory-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.inventory-modal__content {
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

.inventory-modal__header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
}

.inventory-modal__tabs {
  display: flex;
  gap: 1px;
}

.inventory-modal__tab {
  padding: 8px 16px;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.inventory-modal__tab:hover:not(:disabled) {
  background-color: #eaeaea;
}

.inventory-modal__tab--active {
  color: #4a8;
  font-weight: 600;
}

.inventory-modal__tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -16px;
  height: 3px;
  background-color: #4a8;
  border-radius: 3px 3px 0 0;
}

.inventory-modal__tab:disabled {
  color: #aaa;
  cursor: not-allowed;
}

.inventory-modal__close {
  border: none;
  background: transparent;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  padding: 0 8px;
  color: #666;
}

.inventory-modal__close:hover {
  color: #333;
}

.inventory-modal__body {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

.inventory-tab__empty {
  text-align: center;
  padding: 40px;
  color: #888;
  font-style: italic;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.inventory-grid__item {
  min-height: 150px;
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
</style> 