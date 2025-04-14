import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '../types/item'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<Item[]>([])
  const persist = ref(['items']) // Add this to persist items between sessions

  // Getters
  const hasItems = computed(() => items.value.length > 0)
  const itemCount = computed(() => items.value.reduce((total, item) => total + (item.quantity || 1), 0))
  
  // Actions
  function addItem(newItem: Item, quantity = 1) {
    const existingItem = items.value.find(item => item.id === newItem.id)
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + quantity
    } else {
      items.value.push({
        ...newItem,
        quantity
      })
    }
  }
  
  function removeItem(itemId: string, quantity = 1) {
    const index = items.value.findIndex(item => item.id === itemId)
    
    if (index !== -1) {
      const item = items.value[index]
      
      if ((item.quantity || 1) > quantity) {
        item.quantity = (item.quantity || 1) - quantity
      } else {
        items.value.splice(index, 1)
      }
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