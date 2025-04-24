<template>
  <div class="intro-screen screen-container" :style="{ background: questStore.getGradient('primary') }">
    <div class="intro-content" :style="contentStyle">
      <h2>{{ questStore.title }}</h2>
      
      <div class="quest-details">
        <story-block>{{ questStore.description }}</story-block>

        <div class="location-info">
          <div class="location-card" :style="locationCardStyle">
            <p>{{ questStore.startGameLocation?.name || 'Not selected' }}</p>
          </div>
          <div>to</div>
          <div class="location-card" :style="locationCardStyle">
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
          fullWidth
        >
          Continue
        </ButtonInput>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from "@/stores/appStore";
import { useQuestStore } from "@/stores/questStore";
import ButtonInput from "@/components/forms/ButtonInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import StoryBlock from "@/components/StoryBlock.vue";

const questStore = useQuestStore();
const appStore = useAppStore();

// Theme-based styles
const contentStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('card'),
  color: questStore.getTextColor('primary')
}));

const locationCardStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('medium')
}));

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
  padding: 2rem 0;
}

.intro-content {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
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
  align-items: center;
}

.location-card {
  flex: 1;
  padding: 1rem;
  border: 1px solid;
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