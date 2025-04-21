<template>
  <div class="victory-screen">
    <h2>Victory!</h2>
    <p class="congratulations">Congratulations on completing your quest!</p>
    <ButtonInput 
      class="new-quest-button" 
      @click="startNewQuest"
      variant="primary"
      size="large"
      :theme="questStore.theme"
    >
      Start New Quest
    </ButtonInput>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore'
import { useQuestStore } from '@/stores/questStore'
import ButtonInput from '@/components/forms/ButtonInput.vue'

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

/* Custom styling to override ButtonInput defaults if needed */
.new-quest-button {
  margin-top: 1rem;
}
</style> 