<template>
  <div class="inventory-test-screen">
    <h2>Inventory Test Harness</h2>
    <p class="note">This is a development-only screen for testing inventory components.</p>
    
    <div class="inventory-content">
      <h3>Inventory Items</h3>
      <div v-if="!inventoryStore.hasItems" class="inventory-empty">
        <p>Your inventory is empty.</p>
        <button class="add-test-item" @click="addTestItem">
          Add Test Item
        </button>
      </div>
      <div v-else class="inventory-grid">
        <div 
          v-for="item in inventoryStore.items" 
          :key="item.id"
          class="inventory-grid__item"
        >
          <ItemCard 
            :item="item"
            :show-use-button="true"
            :show-inspect-button="true"
            :show-quantity="true"
            @use="handleUseItem(item)"
            @inspect="openItemInspectModal(item)"
          />
        </div>
        
        <div class="inventory-grid__add">
          <button class="add-test-item" @click="addTestItem">
            Add Test Item
          </button>
          <button class="clear-items" @click="clearItems">
            Clear All Items
          </button>
        </div>
      </div>
      
      <div class="test-controls">
        <h3>Test Controls</h3>
        <button @click="toggleModal">Toggle Inventory Modal</button>
        <button @click="continueToMap">Return to Map</button>
      </div>
    </div>
    
    <!-- Item Inspection Modal -->
    <ItemInspectModal
      :is-open="isItemModalOpen"
      :item="selectedItem"
      context="inventory"
      @close="closeItemInspectModal"
      @use="handleUseItemFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "../stores/appStore"
import { useInventoryStore } from "../stores/inventoryStore"
import { getRandomSampleItem } from "../data/sampleItems"
import ItemCard from "../components/ItemCard.vue"
import ItemInspectModal from "../components/ItemInspectModal.vue"
import type { InventoryItem, EnhancedItem } from '../types/item'

const appStore = useAppStore()
const inventoryStore = useInventoryStore()

// State for item inspection modal
const isItemModalOpen = ref(false)
const selectedItem = ref<EnhancedItem>({
  id: '',
  name: '',
  description: ''
})

function continueToMap() {
  appStore.setScreen('map')
}

function addTestItem() {
  const randomItem = getRandomSampleItem()
  inventoryStore.addItem(randomItem)
}

function clearItems() {
  // Remove all items from inventory
  inventoryStore.items.forEach(item => {
    inventoryStore.removeItem(item.id, item.quantity)
  })
}

function toggleModal() {
  appStore.toggleInventory()
}

function handleUseItem(item: InventoryItem) {
  console.log('Using item from card:', item.name)
  // This will be implemented in later stages
  inventoryStore.useItem(item.id)
}

function openItemInspectModal(item: InventoryItem) {
  selectedItem.value = item
  isItemModalOpen.value = true
}

function closeItemInspectModal() {
  isItemModalOpen.value = false
}

function handleUseItemFromModal(item: EnhancedItem) {
  console.log('Using item from modal:', item.name)
  // This will be implemented in later stages
  inventoryStore.useItem(item.id)
}
</script>

<style scoped>
.inventory-test-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  padding: 2rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.note {
  color: #ff9;
  margin-bottom: 2rem;
  font-style: italic;
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.inventory-content {
  flex-grow: 1;
  width: 100%;
  max-width: 1000px;
  margin-bottom: 2rem;
}

.inventory-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.inventory-grid__item {
  min-height: 200px;
}

.inventory-grid__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.add-test-item,
.clear-items {
  padding: 0.8rem 1.5rem;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  max-width: 200px;
}

.add-test-item:hover {
  background-color: #888;
}

.clear-items {
  background-color: #933;
}

.clear-items:hover {
  background-color: #c33;
}

.test-controls {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  gap: 1rem;
}

.test-controls button {
  margin-bottom: 0.5rem;
}
</style> 