<template>
  <div class="story-block" :style="storyBlockStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuestStore } from '@/stores/questStore';

const questStore = useQuestStore();

// Theme-based styles with paper-colored background
const storyBlockStyle = computed(() => ({
  backgroundColor: questStore.theme === 'dark' ? '#2c2417' : '#f5f0e5', // Paper color
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('light'),
}));
</script>

<style scoped>
.story-block {
  padding: 1rem;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style> 