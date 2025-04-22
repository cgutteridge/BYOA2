<template>
  <div class="inventory-tab">
    <div v-if="!hasItems" class="inventory-tab__empty" :style="emptyMessageStyle">
      Your inventory is empty.
    </div>
    <div v-if="shouldShowDebugButton" class="debug-button-container">
      <button 
        @click="addDebugItems" 
        class="debug-button"
        :style="debugButtonStyle"
      >
        Add Debug Items
      </button>
    </div>
    <div v-if="hasItems" class="inventory-grid">
      <div 
        v-for="item in inventoryItems" 
        :key="item.id"
        class="inventory-grid__item"
      >
        <ItemCard 
          :item="item"
          variant="inventory"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useQuestStore } from '@/stores/questStore'
import ItemCard from '@/components/ItemCard.vue'

// Stores
const inventoryStore = useInventoryStore()
const questStore = useQuestStore()

// Computed
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

const shouldShowDebugButton = computed(() => {
  return questStore.isDebugMode && !inventoryStore.hasDebugItems
})

const emptyMessageStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))

const debugButtonStyle = computed(() => ({
  backgroundColor: 'rgba(255, 0, 0, 0.1)',
  color: questStore.getTextColor('primary'),
  borderColor: 'rgba(255, 0, 0, 0.3)',
}))

// Methods
function addDebugItems(): void {
  inventoryStore.addDebugItems()
}
</script>

<style scoped>
.inventory-tab__empty {
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.debug-button-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.debug-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  border: 1px solid;
}
</style> 