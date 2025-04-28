<template>
  <div class="victory-screen screen-container" :style="{ background: questStore.getGradient('primary') }">
    <!-- Star effect container -->
    <div class="star-effect-container">
      <div v-for="i in 24" :key="i" class="particle" :style="getParticleStyle(i)">
        {{ powerIcons[i % powerIcons.length] }}
      </div>
    </div>
    
    <div class="victory-content" :style="contentStyle">
      <h1>You Win!</h1>
      <p>Time for a side-quest to the kebab shop?</p>
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

// Array of power icons from the game
const powerIcons = [
  '🏆', // Victory
  '⚔️', // Kill
  '🪄', // Banish
  '❄️', // Freeze
  '🗿', // Petrify
  '💧', // Pacify
  '🥤', // Distract
  '🥦', // Vegetate
  '🍋', // Stun
  '🎟️', // Token
  '🔭', // ScoutRange
  '🎁', // Lootbox
  '📈', // Grow
  '💰', // Treasure
  '📏', // Shrink
  '✂️', // Split
  '🔄', // Transmute
  '🧤', // Pickpocket
]

const startNewQuest = () => {
  questStore.endQuest()
  appStore.setScreen('start_quest')
}

const backToGame = () => {
  appStore.setScreen('map')
}

// Generate dynamic styles for particles
function getParticleStyle(index: number): Record<string, string> {
  // Determine if particle comes from left or right
  const isLeft = index % 2 === 0
  const startX = isLeft ? '0%' : '100%'
  // Fixed angles: left side goes up and right (135-180 degrees), right side goes up and left (0-45 degrees)
  const angle = isLeft ? 180 + (Math.random() * 90) : 90+Math.random() * 90
  const distance = 2000 + Math.random() * 600
  const rotationAmount = 180 + Math.random() * 720
  const rotationDirection = Math.random() > 0.5 ? 1 : -1
  const delay = Math.random() * 0.7
  const duration = 2.5 + Math.random() * 1.5
  const size = 18 + Math.floor(Math.random() * 14)
  
  return {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    fontSize: `${size}px`,
    '--angle': `${angle}deg`,
    '--distance': `${distance}px`,
    '--rotation': `${rotationAmount * rotationDirection}deg`,
    '--start-x': startX
  }
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
  position: relative;
  overflow: hidden;
}

.star-effect-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  bottom: 0;
  left: var(--start-x);
  transform: translateX(-50%);
  animation: victory-star-animation ease-out infinite;
  z-index: 1;
}

@keyframes victory-star-animation {
  0% {
    opacity: 1;
    transform: translateX(-50%) rotate(var(--angle)) translateY(0) rotate(0deg);
    scale: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) rotate(var(--angle)) translateY(var(--distance)) rotate(var(--rotation));
    scale: 0.3;
  }
}

.victory-content {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  z-index: 2;
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