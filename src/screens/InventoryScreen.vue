<template>
  <div class="inventory-container">
    <div class="inventory-header">
      <h1>Inventory</h1>
      <div class="inventory-controls">
        <button @click="addTestItem" class="test-button">+ Add Test Item</button>
        <button @click="clearInventory" class="clear-button">Clear Items</button>
      </div>
    </div>
    
    <div v-if="inventoryStore.hasItems" class="inventory-items">
      <ItemCard 
        v-for="item in sortedItems" 
        :key="item.id" 
        :item="item" 
        @use="handleUseItem" 
        @inspect="openItemInspectModal" 
      />
    </div>
    <div v-else class="inventory-empty">
      <p>Your inventory is empty.</p>
    </div>
    
    <ItemInspectModal 
      v-if="selectedItem"
      :is-open="isInspectModalOpen" 
      :item="selectedItem" 
      context="inventory" 
      @close="closeItemInspectModal" 
      @use="handleUseItem"  
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from "../stores/inventoryStore"
import { getRandomSampleItem } from "../data/sampleItems"
import ItemCard from "../components/ItemCard.vue"
import ItemInspectModal from "../components/ItemInspectModal.vue"
import type { Item } from '../types/item'

const inventoryStore = useInventoryStore()

// State for item inspection modal
const isInspectModalOpen = ref(false)
const selectedItem = ref<Item | null>(null)

const handleUseItem = (item: Item) => {
  console.log('Using item:', item.name)
  inventoryStore.useItem(item.id)
  // Additional logic for using an item would go here
}

function openItemInspectModal(item: Item) {
  selectedItem.value = item
  isInspectModalOpen.value = true
}

function closeItemInspectModal() {
  isInspectModalOpen.value = false
}

// Sort items by level and then by name
const sortedItems = computed(() => {
  return [...inventoryStore.items].sort((a, b) => {
    // First by level descending
    if (b.level !== a.level) {
      return b.level - a.level
    }
    // Then by name ascending
    return a.name.localeCompare(b.name)
  })
})

function addTestItem() {
  const randomItem = getRandomSampleItem()
  inventoryStore.addItem(randomItem)
}

function clearInventory() {
  // Clear all items from inventory
  while (inventoryStore.items.length > 0) {
    inventoryStore.removeItem(inventoryStore.items[0].id)
  }
}
</script>

<style scoped>
.inventory-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.inventory-controls {
  display: flex;
  gap: 10px;
}

.inventory-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.inventory-empty {
  text-align: center;
  padding: 50px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.test-button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-button {
  background-color: #f44336;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-button:hover, .clear-button:hover {
  opacity: 0.9;
}
</style> 