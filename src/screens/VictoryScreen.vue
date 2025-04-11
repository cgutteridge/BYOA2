<template>
  <div class="victory-screen">
    <h2>Victory!</h2>
    <p class="congratulations">Congratulations on completing your quest!</p>
    <button class="new-quest-button" @click="startNewQuest">Start New Quest</button>
  </div>
</template>

<script setup lang="ts">

import {useAppStore} from "../stores/appStore";
import {useQuestStore} from "../stores/questStore";

const appStore = useAppStore()
const questStore = useQuestStore()
function startNewQuest() {
  questStore.endQuest()
  appStore.setScreen('start_quest')
}
</script>

<style scoped>
.victory-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  gap: 2rem;
}

.congratulations {
  font-size: 1.5rem;
  color: #4CAF50;
}

.new-quest-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.new-quest-button:hover {
  background: #45a049;
}
</style> 