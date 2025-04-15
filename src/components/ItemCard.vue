<template>
  <div 
    class="item-card" 
    :class="{
      'item-card--selected': isSelected,
      'item-card--has-targets': hasValidTargets
    }"
    @click="inspectItem"
  >
    <div class="item-card__name">{{ item.name }}</div>
    <div class="item-card__uses">{{ item.uses }}</div>
    <div v-if="hasValidTargets" class="item-card__target-badge" title="Has valid targets in this location">🎯</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '../types/item'
import { useAppStore } from '../stores/appStore'
import { useQuestStore } from '../stores/questStore'
import { validTargets } from '../helpers/targetingHelpers'

// Get the stores
const appStore = useAppStore()
const questStore = useQuestStore()

// Define props
const props = defineProps<{
  item: Item
}>()

// Is this item currently selected?
const isSelected = computed(() => {
  return appStore.inspectedItem?.id === props.item.id
})

// Determine if we're in a location with the inventory open
const isInPubWithInventory = computed(() => {
  return !!questStore.currentPub && appStore.isInventoryOpen
})

// Check if this item has valid targets in the current location
const hasValidTargets = computed(() => {
  // Only check if we're in a location with monsters
  if (!isInPubWithInventory.value || !questStore.currentPub?.monsters) {
    return false
  }
  
  // Only apply to items with targeting powers
  if (!props.item.power || !['kill', 'transmute', 'shrink', 'split', 'pickpocket', 'banish'].includes(props.item.power)) {
    return false
  }
  
  // Check if there are valid targets for this item
  const targets = validTargets(props.item, questStore.currentPub.monsters)
  return targets.length > 0
})

// Handler for clicking on the item card
function inspectItem() {
  appStore.openItemInspectModal(props.item)
}
</script>

<style scoped>
.item-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  min-height: 60px;
}

.item-card--selected {
  border-color: #4a8;
  background-color: #f0f8f4;
  box-shadow: 0 0 0 2px rgba(68, 170, 136, 0.3);
}

.item-card--has-targets {
  border-color: #f80;
  background-color: #fff8f0;
  box-shadow: 0 0 0 2px rgba(255, 136, 0, 0.3);
}

.item-card--selected.item-card--has-targets {
  border-color: #4a8;
  background-color: #f0f8f4;
  box-shadow: 0 0 0 2px rgba(68, 170, 136, 0.3), 0 0 0 4px rgba(255, 136, 0, 0.3);
}

.item-card__name {
  padding: 12px 16px;
  font-weight: 600;
  flex-grow: 1;
}

.item-card__uses {
  align-self: stretch;
  padding: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  text-align: center;
}

.item-card__target-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background-color: #f80;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style> 