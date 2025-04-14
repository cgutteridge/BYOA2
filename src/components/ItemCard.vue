<template>
  <div 
    class="item-card" 
    :class="{'item-card--selected': selected}"
    @click="$emit('click', item)"
  >
    <div class="item-card__name">{{ item.name }}</div>
    <div class="item-card__uses">{{ item.uses }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Item } from '../types/item'

// Define props directly instead of storing in a variable
defineProps<{
  item: Item
  selected?: boolean
  showUseButton?: boolean
  showInspectButton?: boolean
}>()

// Define emits
defineEmits<{
  (e: 'click', item: Item): void
  (e: 'use', item: Item): void
  (e: 'inspect', item: Item): void
}>()
</script>

<style scoped>
.item-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f8f8f8;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.item-card--selected {
  border-color: #4a8;
  background-color: #f0f8f4;
  box-shadow: 0 0 0 2px rgba(68, 170, 136, 0.3);
}

.item-card__name {
  padding: 12px 16px;
  font-weight: 600;
  flex-grow: 1;
}

.item-card__uses {
  height: 100%;
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