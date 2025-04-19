<template>
  <div class="intro-screen screen-container">
    <div class="quest-info">
      <h2>{{ questStore.title }}</h2>
      <p class="description">{{ questStore.description }}</p>

      <div class="gameLocation-info">
        <div class="start-gameLocation">
          <h3>Start GameLocation</h3>
          <p>{{ questStore.startGameLocation?.name || 'Not selected' }}</p>
        </div>

        <div class="end-gameLocation">
          <h3>End GameLocation</h3>
          <p>{{ questStore.endGameLocation?.name || 'Not selected' }}</p>
        </div>
      </div>

    </div>
    <button v-if="questStore.status==='active' "class="continue-button" @click="start">Continue</button>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore.js";
import {useQuestStore} from "@/stores/questStore.ts";

const questStore = useQuestStore();
const appStore = useAppStore()

function start() {
  appStore.setScreen('gameLocation')
}
</script>

<style scoped>
.intro-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  padding: 2rem 0;
}
</style> 