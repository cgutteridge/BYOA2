<template>
  <div class="story-block">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useQuestStore } from '@/stores/questStore';

const questStore = useQuestStore();
</script>

<style scoped>
.story-block {
  padding: 1.5rem;
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 1rem;
  position: relative;
  background-color: v-bind('questStore.theme === "dark" ? "rgba(60, 50, 40, 0.85)" : "#f5f0e5"');
  color: v-bind('questStore.getTextColor("primary")');
  
  /* Parchment background */
  background-image: url('/images/canvas.jpg');
  background-size: cover;
  background-blend-mode: v-bind('questStore.theme === "dark" ? "soft-light" : "multiply"');
  
  /* Torn parchment effect */
  border: none;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  
  /* Rough, uneven edges */
  clip-path: polygon(
    0% 3%, 2% 0%, 8% 1%, 15% 0%, 20% 2%, 30% 0%, 35% 3%,
    40% 1%, 50% 0%, 60% 2%, 65% 0%, 75% 1%, 85% 0%, 95% 2%, 100% 1%, 
    100% 96%, 98% 100%, 92% 99%, 85% 100%, 80% 98%, 70% 100%, 65% 97%, 
    60% 99%, 50% 100%, 40% 98%, 35% 100%, 25% 99%, 15% 100%, 5% 98%, 0% 99%
  );
}

/* Parchment texture overlay */
.story-block::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100" height="100" filter="url(%23noise)" opacity="0.08"/></svg>');
  background-repeat: repeat;
  opacity: v-bind('questStore.theme === "dark" ? 0.2 : 0.08');
  pointer-events: none;
  z-index: 1;
}

.story-block > * {
  position: relative;
  z-index: 2;
}
</style> 