<template>
  <div class="level-indicator" :style="indicatorStyle">
    <div class="level-text">LEVEL</div>
    <div class="level-value">{{ questStore.level }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuestStore } from '@/stores/questStore'

const questStore = useQuestStore()

// Compute styles based on theme
const indicatorStyle = computed(() => ({
  backgroundColor: 'black',
  color: 'white',
  boxShadow: `0 4px 8px ${questStore.getBorderColor('dark')}`
}))
</script>

<style scoped>
.level-indicator {
  position: fixed;
  bottom: 5px;
  left: 5px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  z-index: 200;
  transition: all 0.2s ease;
}

.level-text {
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: -2px;
}

.level-value {
  font-size: 24px;
  font-weight: bold;
}

.level-indicator:hover {
  transform: scale(1.1);
}
</style> 