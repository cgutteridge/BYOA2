<template>
  <div 
    class="item-card" 
    :class="{'item-card--selected': selected}"
    @click="$emit('click', item)"
  >
    <div class="item-card__header">
      <h3 class="item-card__title">{{ item.name }}</h3>
      <div v-if="showQuantity && item.quantity && item.quantity > 1" class="item-card__quantity">
        x{{ item.quantity }}
      </div>
      <div v-if="item.uses !== undefined" class="item-card__uses">
        Uses: {{ item.uses }}
      </div>
    </div>
    
    <div class="item-card__description">
      {{ item.description }}
    </div>
    
    <div class="item-card__footer">
      <button 
        v-if="showUseButton && item.power" 
        class="item-card__use-btn"
        @click.stop="$emit('use', item)"
      >
        Use
      </button>
      
      <button 
        v-if="showInspectButton" 
        class="item-card__inspect-btn"
        @click.stop="$emit('inspect', item)"
      >
        Inspect
      </button>
    </div>
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
  showQuantity?: boolean
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
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8f8f8;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #aaa;
}

.item-card--selected {
  border-color: #4a8;
  background-color: #f0f8f4;
  box-shadow: 0 0 0 2px rgba(68, 170, 136, 0.3);
}

.item-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-card__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.item-card__quantity,
.item-card__uses {
  font-size: 0.9rem;
  color: #666;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.item-card__description {
  flex-grow: 1;
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 12px;
}

.item-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.item-card__use-btn,
.item-card__inspect-btn {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item-card__use-btn {
  background-color: #4a8;
  color: white;
}

.item-card__use-btn:hover {
  background-color: #3a7;
}

.item-card__inspect-btn {
  background-color: #48a;
  color: white;
}

.item-card__inspect-btn:hover {
  background-color: #379;
}
</style> 