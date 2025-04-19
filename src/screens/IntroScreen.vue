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
    <ButtonInput 
      class="continue-button" 
      @click="start"
      :locked="questStore.status!=='active'"
      variant="primary"
      size="large"
      :theme="questStore.theme"
    >
      Continue
    </ButtonInput>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore.js";
import {useQuestStore} from "@/stores/questStore.ts";
import ButtonInput from "@/components/forms/ButtonInput.vue";
import { ref } from 'vue';

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

.continue-button {
  margin-top: 2rem;
}
</style> 