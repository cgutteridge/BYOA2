import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '../types'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<Item[]>([])
  const persist = ref(['items']) // Add this to persist items between sessions

  // Getters
  const hasItems = computed(() => items.value.length > 0)
  const itemCount = computed(() => items.value.length)
  
  // Actions
  function addItem(newItem: Item) {
    // Check if item with same ID already exists
    const exists = items.value.some(item => item.id === newItem.id)
    
    if (!exists) {
      items.value.push({
        ...newItem,
        timestamp: Date.now() // Add timestamp when item is first added
      })
    }
  }
  
  function removeItem(itemId: string) {
    const index = items.value.findIndex(item => item.id === itemId)
    
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }
  
  function useItem(itemId: string) {
    const item = items.value.find(item => item.id === itemId)
    
    if (item) {
      // If item has uses, decrement them
      if (item.uses !== undefined) {
        item.uses--
        
        // Remove if no uses left
        if (item.uses <= 0) {
          removeItem(itemId)
        }
      }
    }
  }
  
  return {
    // State
    items,
    persist,
    
    // Getters
    hasItems,
    itemCount,
    
    // Actions
    addItem,
    removeItem,
    useItem
  }
}) 