<template>
  <div class="inventory-tab">
    <div v-if="!hasItems" class="inventory-tab__empty" :style="emptyMessageStyle">
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

const emptyMessageStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))
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

.inventory-grid__item {
  margin-bottom: 1rem;
}
</style> 