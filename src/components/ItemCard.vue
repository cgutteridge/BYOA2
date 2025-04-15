<template>
  <div 
    class="item-card" 
    :class="{
      'item-card--selected': isSelected,
      'item-card--has-targets': hasValidTargets,
      'item-card--compact': compact,
      'item-card--prize': variant === 'prize',
      'item-card--gift': variant === 'gift',
      'item-card--drop': variant === 'drop'
    }"
    :data-power="item.power"
    :aria-label="`${item.name}, ${generateEffectDescription(item)}, ${item.uses !== undefined ? item.uses + ' uses remaining' : 'Unlimited uses'}`"
    @click="handleClick"
  >
    <div class="item-card__icon" v-if="item.power">
      <span class="icon" :class="`icon-${item.power}`">{{ getPowerIcon(item.power) }}</span>
    </div>
    <div class="item-card__content">
      <div class="item-card__name">{{ item.name }}</div>
      <div class="item-card__power" v-if="showDetails">{{ generateEffectDescription(item) }}</div>
    </div>
    <div class="item-card__uses">{{ item.uses !== undefined ? item.uses : '∞' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '../types/item'
import { useAppStore } from '../stores/appStore'
import { useQuestStore } from '../stores/questStore'
import { usePubStore } from '../stores/pubStore'
import { powerFactory, getValidTargets } from '../powers'
import { generateEffectDescription } from '../quest/generateEffectDescription.ts'

// Get the stores
const appStore = useAppStore()
const questStore = useQuestStore()
const pubStore = usePubStore()

// Define props
const props = defineProps<{
  item: Item
  variant?: 'inventory' | 'prize' | 'gift' | 'drop'
  compact?: boolean
  showDetails?: boolean
}>()

// Define emits for item actions
const emit = defineEmits<{
  (e: 'action', item: Item): void
}>()

// Get power icon based on item power
function getPowerIcon(power: string | undefined): string {
  if (!power) return '?'
  return powerFactory.getIcon(power)
}

// Is this item currently selected?
const isSelected = computed(() => {
  return appStore.inspectedItem?.id === props.item.id
})

// Determine if we're in a location with the inventory open
const isInPubWithInventory = computed(() => {
  return !!questStore.currentPub && appStore.isInterfaceOpen
})

// Check if this item has valid targets in the current location
const hasValidTargets = computed(() => {
  // Only check for inventory variant
  if (props.variant !== 'inventory' && props.variant !== undefined) {
    return false
  }
  
  // Only apply to items with targeting powers
  if (!props.item.power) {
    return false
  }
  
  // Different handling for spy vs monster targeting items
  if (props.item.power === 'spy') {
    // For spy items, check if there are unscouted pubs
    return pubStore.pubs.some(pub => !pub.scouted)
  } else {
    // For monster targeting items, check if we're in a location with valid monster targets
    if (!isInPubWithInventory.value || !questStore.currentPub?.monsters) {
      return false
    }
    
    // Check if there are valid targets for this item
    const targets = getValidTargets(props.item, questStore.currentPub.monsters)
    return targets.length > 0
  }
})

// Handler for clicking on the item card
function handleClick() {
  // If the item is a prize, gift, or drop, try to take it
  if (props.variant === 'prize' || props.variant === 'gift' || props.variant === 'drop') {
    emit('action', props.item)
    // After taking the item, show its description
    appStore.openItemInspectModal(props.item)
  } else {
    // For inventory items or undefined variant, just show the description
    appStore.openItemInspectModal(props.item)
  }
}
</script>

<style scoped>
.item-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  overflow: visible;
  position: relative;
  min-height: 60px;
  transition: all 0.2s;
}

.item-card--selected {
  border-color: #999;
  background-color: #eee;
  box-shadow: 0 0 0 2px rgba(153, 153, 153, 0.3);
}

/* Base has-targets styling with glowing effect */
.item-card--has-targets {
  border-width: 2px;
  border-color: v-bind("props.item.power ? powerFactory.getGlowColor(props.item.power) : 'white'");
  z-index: 2;
  animation: pulse-glow 2s infinite alternate;
}

@keyframes pulse-glow {
  from {
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 12px rgba(255, 255, 255, 0.2);
  }
  to {
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5);
  }
}

/* This keeps the animation but uses a dynamic color setup */
.item-card--has-targets:after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 8px;
  pointer-events: none;
  background: transparent;
  opacity: 0;
  box-shadow: 0 0 8px v-bind("props.item.power ? powerFactory.getGlowColor(props.item.power) : 'rgba(255, 255, 255, 0.8)'");
  animation: pulse-glow-effect 2s infinite alternate;
}

@keyframes pulse-glow-effect {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.7;
  }
}

.item-card--compact {
  min-height: 40px;
  padding: 5px 0;
}

/* Variant styling */
.item-card--prize,
.item-card--gift,
.item-card--drop {
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-card__icon {
  align-self: stretch;
  width: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px 0 0 8px;
  font-size: 1.4rem;
  text-align: center;
}

.item-card__content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 8px 12px;
  overflow: hidden;
}

.item-card__name {
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.item-card__power {
  font-size: 0.85rem;
  color: #555;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-card__uses {
  align-self: stretch;
  width: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  background-color: rgba(0, 0, 0, 0.1);
  font-weight: bold;
  text-align: center;
  border-radius: 0 8px 8px 0;
}
</style> 