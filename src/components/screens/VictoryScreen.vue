<template>
  <div class="victory-screen screen-container" :style="{ background: questStore.getGradient('primary') }">
    <div class="victory-content" :style="contentStyle">
      <h1>You Win!</h1>
      <p>Congratulations on completing your quest!</p>
      <div class="button-group">
        <button @click="backToGame" class="button" :style="buttonStyle('primary')">Back to Map</button>
        <button @click="startNewQuest" class="button" :style="buttonStyle('secondary')">Start New Quest</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useQuestStore } from '@/stores/questStore'

const appStore = useAppStore()
const questStore = useQuestStore()

const startNewQuest = () => {
  questStore.endQuest()
  appStore.setScreen('start_quest')
}

const backToGame = () => {
  appStore.setScreen('map')
}

// Theme-based styles
const contentStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('card'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium')
}))

const buttonStyle = (variant: 'primary' | 'secondary') => ({
  backgroundColor: questStore.getButtonColors(variant).background,
  color: questStore.getButtonColors(variant).text,
  borderColor: questStore.getButtonColors(variant).border
})
</script>

<style scoped>
.victory-screen {
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.victory-content {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.button {
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.button:hover {
  opacity: 0.9;
}
</style> 