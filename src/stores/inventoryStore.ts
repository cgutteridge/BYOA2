import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {Item} from '../types'
import {createDebugItems} from '@/quest/debugItems'
import {createDemoItems} from '@/quest/demoItems'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<Item[]>([])
  const persist = ref(['items']) // Add this to persist items between sessions

  // Getters
  const hasItems = computed(() => items.value.length > 0)
  const itemCount = computed(() => items.value.length)
  const hasDebugItems = computed(() => items.value.some(item => item.name.includes('DEBUG')))
  const hasDemoItems = computed(() => items.value.some(item => item.name.includes('DEMO')))
  const tokenCount = computed(() => items.value.filter(item => item.power === 'token').length)
  
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

  function addDebugItems(): void {
    const debugItems = createDebugItems()
    debugItems.forEach(item => addItem(item))
  }

  function addDemoItems(): void {
    const demoItems = createDemoItems()
    demoItems.forEach(item => addItem(item))
  }

  function emptyInventory(): void {
    items.value = []
  }

  return {
    // State
    items,
    persist,
    
    // Getters
    hasItems,
    itemCount,
    hasDebugItems,
    hasDemoItems,
    tokenCount,
    
    // Actions
    addItem,
    removeItem,
    addDebugItems,
    addDemoItems,
    emptyInventory,
  }
}) 