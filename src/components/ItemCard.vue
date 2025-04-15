<template>
  <div 
    class="item-card" 
    :class="{
      'item-card--selected': isSelected,
      'item-card--compact': compact,
      'item-card--prize': variant === 'prize',
      'item-card--gift': variant === 'gift',
      'item-card--drop': variant === 'drop'
    }"
    @click="handleClick"
  >
    <div class="item-card__name">{{ item.name }}</div>
    <div class="item-card__power" v-if="showDetails">{{ item.effectDescription || item.power }}</div>
    <div class="item-card__uses">{{ item.uses !== undefined ? item.uses : '∞' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '../types/item'
import { useAppStore } from '../stores/appStore'
import { useQuestStore } from '../stores/questStore'

// Get the stores
const appStore = useAppStore()
const questStore = useQuestStore()

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

// Is this item currently selected?
const isSelected = computed(() => {
  return appStore.inspectedItem?.id === props.item.id
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
  overflow: hidden;
  position: relative;
  min-height: 60px;
  transition: all 0.2s;
}

.item-card--selected {
  border-color: #999;
  background-color: #eee;
  box-shadow: 0 0 0 2px rgba(153, 153, 153, 0.3);
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

.item-card__name {
  padding: 12px 16px;
  font-weight: 600;
  flex-grow: 1;
}

.item-card__power {
  font-size: 0.85rem;
  color: #555;
  padding: 0 8px;
  max-width: 60%;
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
</style> 