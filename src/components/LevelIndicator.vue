<template>
  <div class="level-indicator-container">
    <svg class="level-indicator" width="70" height="70" viewBox="0 0 70 70" :style="indicatorStyle"
         @click="handleClick()" :class="{ 'level-up': showLevelUpAnimation }"
    >
      <!-- Background circle -->
      <circle cx="35" cy="35" r="32" fill="black" />
      
      <!-- Unmet progress indicator (dark red) -->
      <circle 
        cx="35" 
        cy="35" 
        r="30"
        stroke="#5a0000"
        stroke-width="4"
        fill="transparent"
      />
      
      <!-- Progress indicator - simple circular segment approach -->
      <circle 
        v-if="questStore.levelProgress > 0"
        cx="35" 
        cy="35" 
        r="30"
        class="progress-indicator"
        stroke="#00cc44"
        stroke-width="4"
        :stroke-dasharray="`${progressArc} ${fullCircle - progressArc}`"
        stroke-dashoffset="0"
        stroke-linecap="round"
        fill="transparent"
        transform="rotate(-90, 35, 35)"
      />
      
      <!-- Level text group -->
      <g class="level-text-group">
        <text x="35" y="26" class="level-text" text-anchor="middle">LEVEL</text>
        <text x="35" y="48" class="level-value" text-anchor="middle">{{ questStore.level }}</text>
      </g>
    </svg>
    
    <!-- Level up animations container -->
    <div v-if="showLevelUpAnimation" class="animation-container">
      <!-- Stars and emojis -->
      <div v-for="i in 24" :key="i" class="particle" :style="getParticleStyle(i)">
        {{ i % 4 === 0 ? '⭐' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🎉' : '🎊' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuestStore } from '@/stores/questStore'
import { useAppStore } from '@/stores/appStore'

const questStore = useQuestStore()
const appStore = useAppStore()
const showLevelUpAnimation = ref(false)

// Circumference of the progress circle
const fullCircle = 188.5 // 2 * PI * r where r = 30

// Calculate the progress arc length
const progressArc = computed((): number => {
  return (questStore.levelProgress / 100) * fullCircle
})

const indicatorStyle = computed(() => {
  const isDarkMode = questStore.theme === 'dark'
  return {
    filter: isDarkMode 
      ? 'drop-shadow(0 4px 6px rgba(255, 255, 255, 0.2))' 
      : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))',
    transition: 'all 0.3s ease'
  }
})

// Watch level changes to trigger animation
watch(() => questStore.level, (newLevel, oldLevel) => {
  if (newLevel > oldLevel) {
    triggerLevelUpAnimation()
  }
})

// Function to handle click on the level indicator
function handleClick(): void {
  // Then open the interface on the quest tab
  appStore.openInterface('quest')
}

// Function to trigger level up animation
function triggerLevelUpAnimation(): void {
  showLevelUpAnimation.value = true
  
  // Reset the animation after some time
  setTimeout(() => {
    showLevelUpAnimation.value = false
  }, 5000)
}

// Generate dynamic styles for particles
function getParticleStyle(index: number): Record<string, string> {
  // Generate random angle between up (270 degrees) and right (0/360 degrees)
  // This maps to the range: 270-360 degrees
  const angle = 270 + (Math.random() * 90)
  const distance = 800 + Math.random() * 600 // Doubled distance (was 400 + random 300)
  const rotationAmount = 180 + Math.random() * 720 // Up to 2.5 full rotations
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
    '--rotation': `${rotationAmount * rotationDirection}deg`
  }
}
</script>

<style scoped>
.level-indicator-container {
  position: fixed;
  bottom: 5px;
  left: 5px;
  z-index: 200;
  width: 70px;
  height: 70px;
  transition: all 0.3s ease;
}

.level-indicator {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 210;
}

.level-indicator:hover {
  transform: scale(1.1);
}

.progress-indicator {
  transition: stroke-dasharray 0.5s ease-out;
  filter: drop-shadow(0 0 3px rgba(0, 204, 68, 0.5));
}

.level-text {
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  fill: white;
}

.level-value {
  font-size: 24px;
  font-weight: bold;
  fill: white;
}

/* Level up animation */
.level-up {
  animation: big-pulse 0.6s ease-in-out 4;
  z-index: 1000;
}

@keyframes big-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 190;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center;
  animation: spin-out-fade ease-out forwards;
  z-index: 190;
}

@keyframes spin-out-fade {
  0% {
    opacity: 1;
    transform: rotate(var(--angle)) translateX(0) rotate(0deg);
    scale: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(var(--distance)) rotate(var(--rotation));
    scale: 0.3;
  }
}
</style> 