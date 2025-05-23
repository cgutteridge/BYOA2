<template>
  <div class="options-tab">
    <h2>Game Options</h2>
    
    <div class="options-section">
      <h3>Theme Settings</h3>
      <div class="theme-option">
        <span class="option-label">Theme:</span>
        <div class="theme-buttons">
          <button
            @click="toggleTheme" 
            class="theme-toggle-button"
            :style="{ color: questStore.getTextColor('primary') }"
          >
            {{ questStore.theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode' }}
          </button>
        </div>
      </div>
      
      <div class="theme-option">
        <span class="option-label">Debug Mode:</span>
        <div class="theme-buttons">
          <button
            @click="toggleDebugMode" 
            class="theme-toggle-button"
            :class="{ 'debug-active': questStore.isDebugMode }"
            :style="{ color: questStore.getTextColor('primary') }"
          >
            {{ questStore.isDebugMode ? '🐞 Disable Debug Mode' : '🐞 Enable Debug Mode' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="options-section">
      <MapTileSelector />
    </div>
    
    <div class="options-section">
      <h3>Game Controls</h3>
      <button class="quit-button" @click="showQuitConfirmation = true" :style="{ color: questStore.getTextColor('primary') }">
        Quit Game
      </button>
    </div>

    <ConfirmationModal
      v-model="showQuitConfirmation"
      question="Are you sure you want to END THE QUEST? Everything will be LOST!"
      action-text="Yes, End Quest"
      cancel-text="No, Continue Playing"
      :action="quitQuest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuestStore } from '@/stores/questStore'
import { useAppStore } from '@/stores/appStore' 
import ConfirmationModal from '@/components/forms/ConfirmationModal.vue'
import MapTileSelector from '@/components/forms/MapTileSelector.vue'

// Stores
const questStore = useQuestStore()
const appStore = useAppStore()

// Confirmation modal state
const showQuitConfirmation = ref(false)

// Methods
function toggleTheme(): void {
  questStore.toggleTheme()
}

function toggleDebugMode(): void {
  questStore.toggleDebugMode()
}

function quitQuest(): void {
  appStore.setScreen('start_quest')
  questStore.endQuest()
  appStore.closeInterface()
}
</script>

<style scoped>
.options-tab h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
}

.options-tab h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
}

.options-section {
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.option-label {
  min-width: 100px;
  font-weight: 500;
}

.theme-buttons {
  display: flex;
  gap: 0.5rem;
}

.theme-toggle-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-active {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.quit-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: inherit;
}
</style> 