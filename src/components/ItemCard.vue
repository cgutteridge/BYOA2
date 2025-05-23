<template>
  <div 
    class="item-card" 
    :class="{
      'item-card--has-targets': canItemBeUsed,
      'item-card--compact': compact,
      'item-card--prize': variant === 'prize',
      'item-card--gift': variant === 'gift',
      'item-card--drop': variant === 'drop'
    }"
    :data-power="item.power"
    :aria-label="`${item.name}, ${itemEffect}, ${item.uses !== undefined ? item.uses + ' uses remaining' : 'Unlimited uses'}`"
    @click="handleClick"
  >
    <div class="item-card__icon" v-if="item.power">
      <span class="icon" :class="`icon-${item.power}`">{{ getItemPowerIcon(item.power) }}</span>
    </div>
    <div class="item-card__content">
      <div class="item-card__name">{{ item.name }}</div>
      <div class="item-card__power" v-if="showDetails">{{ itemEffect }}</div>
      <div class="item-card__power" v-if="showRestrictions">{{ itemRestrictions }}</div>
    </div>
    <div class="item-card__uses">{{ item.uses !== undefined ? item.uses : '∞' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Item, ItemPowerId } from '../types'
import { useAppStore } from '../stores/appStore'
import { powerFactory } from '../powers'
import { itemCanBeUsed} from '../quest/itemUtils.ts'

// Get the stores
const appStore = useAppStore()

// Define props
const props = defineProps<{
  item: Item
  variant?: 'inventory' | 'prize' | 'gift' | 'drop'
  compact?: boolean
  showDetails?: boolean
  showRestrictions?: boolean
}>()

// Define emits for item actions
const emit = defineEmits<{
  (e: 'action', item: Item): void
}>()

// Get power icon based on item power
const getItemPowerIcon = (power: ItemPowerId | undefined): string => {
  if (!power) return '?'
  const powerObj = powerFactory.getPower(power)
  return powerObj?.icon || '?'
}

const itemEffect = computed(()=> {
  const powerObj = powerFactory.getPower(props.item.power)
  return powerObj?.generateEffectDescription(props.item) || 'unknown'
})

const itemRestrictions = computed(()=> {
  const powerObj = powerFactory.getPower(props.item.power)
  return powerObj?.generateRestrictionText(props.item) || ''
})

// Check if this item has valid targets in the current location
const canItemBeUsed = computed(() => itemCanBeUsed(props.item))

// Handler for clicking on the item card
function handleClick() {
  // If the item is a prize, gift, or drop, try to take it
  if (props.variant === 'prize' || props.variant === 'gift' || props.variant === 'drop') {
    emit('action', props.item)
    // Don't open modal after taking the item - let the action handler decide what to do
  } else {
    // For inventory items or undefined variant, just show the description
    appStore.openItemInspectModal(props.item)
  }
}


// nb this *is* used by the css below
const getPowerGlowColor = (power: ItemPowerId): string => {
  const powerObj = powerFactory.getPower(power)
  return powerObj?.glowColor || 'rgba(255, 255, 255, 0.8)'
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

/* Base has-targets styling with glowing effect */
.item-card--has-targets {
  border-width: 2px;
  border-color: v-bind("props.item.power ? getPowerGlowColor(props.item.power) : 'white'");
  z-index: 2;
  animation: pulse-glow 2s infinite alternate;
}

@keyframes pulse-glow {
  from {
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.3);
  }
  to {
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.7);
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
  box-shadow: 0 0 15px v-bind("props.item.power ? getPowerGlowColor(props.item.power) : 'rgba(255, 255, 255, 0.8)'");
  animation: pulse-glow-effect 2s infinite alternate;
}

@keyframes pulse-glow-effect {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.9;
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

.item-card--prize {
  border-color: #ffd700; /* Gold */
  background: linear-gradient(135deg, #fffcef 0%, #fff8d6 100%);
}

.item-card--gift {
  border-color: #4caf50; /* Green */
  background: linear-gradient(135deg, #f0fff0 0%, #e0f7e0 100%);
}

.item-card--drop {
  border-color: #2196f3; /* Blue */
  background: linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%);
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