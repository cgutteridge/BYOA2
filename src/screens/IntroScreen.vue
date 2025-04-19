<template>
  <div class="intro-screen screen-container">
    <div class="intro-content">
      <h2>{{ questStore.title }}</h2>
      
      <div class="quest-details">
        <p class="description">{{ questStore.description }}</p>

        <div class="location-info">
          <div class="location-card">
            <h3>Start GameLocation</h3>
            <p>{{ questStore.startGameLocation?.name || 'Not selected' }}</p>
          </div>

          <div class="location-card">
            <h3>End GameLocation</h3>
            <p>{{ questStore.endGameLocation?.name || 'Not selected' }}</p>
          </div>
        </div>
      </div>

      <LoadingSpinner v-if="questStore.status!=='active'" message="Initialising Quest..." />

      <div class="button-container">
        <ButtonInput 
          class="continue-button" 
          :action="start"
          :locked="questStore.status!=='active'"
          variant="primary"
          size="large"
          :theme="questStore.theme"
          fullWidth
        >
          Continue
        </ButtonInput>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/appStore";
import { useQuestStore } from "@/stores/questStore";
import ButtonInput from "@/components/forms/ButtonInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const questStore = useQuestStore();
const appStore = useAppStore();

function start(): void {
  appStore.setScreen('location');
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

.intro-content {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  margin: auto;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.quest-details {
  margin: 2rem 0;
}

.description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.location-info {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.location-card {
  flex: 1;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.button-container {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.continue-button {
  min-width: 200px;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style> 