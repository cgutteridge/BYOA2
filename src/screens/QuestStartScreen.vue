<template>
  <div class="quest-start-screen screen-container">

    <div class="quest-start-content">
      <h2>Start Your Quest</h2>
      
      <div class="theme-toggle">
        <button 
          @click="toggleTheme" 
          class="theme-button"
          :class="{ active: currentTheme === 'dark' }"
        >
          {{ currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode' }}
        </button>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading gameLocations...</p>
      </div>
      
      <div v-else class="quest-form">
        <div class="gameLocation-selection">
          <div class="gameLocation-selector">
            <h3>Start GameLocation</h3>
            <PickerComponent
              v-model="startLocationId"
              :options="locationStore.locations"
              searchable
              gameLocationholder="Search for a gameLocation..."
              value-property="id"
              display-property="name"
              @selection-change="updateStartGameLocation"
              :theme="currentTheme"
            />
          </div>
          
          <div class="gameLocation-selector">
            <h3>End GameLocation</h3>
            <PickerComponent
              v-model="endLocationId"
              :options="locationStore.locations"
              searchable
              gameLocationholder="Search for a gameLocation..."
              value-property="id"
              display-property="name"
              @selection-change="updateEndGameLocation"
              :theme="currentTheme"
            />
          </div>
        </div>
        
        <div class="quest-details">
          <input 
            v-model="questTitle" 
            type="text" 
            gameLocationholder="Quest Title" 
            class="quest-input"
          />
          
          <div class="difficulty-selector">
            <ButtonPickerComponent
              v-model="selectedDifficulty"
              :options="[
                { id: 'easy', name: 'Easy' },
                { id: 'medium', name: 'Medium' },
                { id: 'hard', name: 'Hard' }
              ]"
              title="Difficulty Level"
              :theme="currentTheme"
            />
          </div>
          
          <div class="player-count-selector">
            <CounterPickerComponent
              v-model="playerCount"
              title="Number of Players"
              :min="1"
              :max="6"
              description="Monsters scale with player count:<br>• Minions: 2× player count<br>• Grunts: 1× player count<br>• Elites: Fixed (1) or scaled on hard difficulty<br>• Bosses: Always 1"
              :theme="currentTheme"
            />
          </div>
        </div>
        
        <button 
          class="start-quest-button" 
          @click="callStartQuest"
          :disabled="!canStartQuest"
        >
          Start Quest
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../stores/appStore'
import { startQuest } from "@/quest/startQuest.ts"
import PickerComponent from '@/components/PickerComponent.vue'
import ButtonPickerComponent from '@/components/ButtonPickerComponent.vue'
import CounterPickerComponent from '@/components/CounterPickerComponent.vue'
import {GameLocation} from "@/types";
import {useLocationStore} from "@/stores/locationStore.ts";

const appStore = useAppStore()
const locationStore = useLocationStore()

const selectedStartLocation = ref<GameLocation | null>(null)
const selectedEndLocation = ref<GameLocation | null>(null)
const startLocationId = ref<string>('')
const endLocationId = ref<string>('')
const questTitle = ref('The ring of Badgers')
const isLoading = ref(true)
const selectedDifficulty = ref('medium')
const playerCount = ref(3)
const currentTheme = ref<'light' | 'dark'>('light') // Updated with proper type

// Watch for gameLocations to be loaded
watch(() => locationStore.locations, (newLocations) => {
  if (newLocations.length > 0) {
    isLoading.value = false
  }
}, { immediate: true })

// Watch for id changes to update the gameLocation objects
watch([startLocationId], () => {
  if (startLocationId.value) {
    const gameLocation = locationStore.locations.find((p:GameLocation) => p.id === startLocationId.value)
    if (gameLocation) {
      selectedStartLocation.value = gameLocation
    }
  } else {
    selectedStartLocation.value = null
  }
}, { immediate: true })

watch([endLocationId], () => {
  if (endLocationId.value) {
    const gameLocation = locationStore.locations.find((p:GameLocation) => p.id === endLocationId.value)
    if (gameLocation) {
      selectedEndLocation.value = gameLocation
    }
  } else {
    selectedEndLocation.value = null
  }
}, { immediate: true })

const canStartQuest = computed(() => {
  // Debug log
  console.log('Checking if can start quest:', {
    selectedStartGameLocation: selectedStartLocation.value,
    selectedEndGameLocation: selectedEndLocation.value,
    startGameLocationId: startLocationId.value,
    endGameLocationId: endLocationId.value,
    questTitle: questTitle.value
  })
  
  // We have gameLocations selected either via objects or IDs
  const hasStartLocation = !!(selectedStartLocation.value || startLocationId.value)
  const hasEndLocation = !!(selectedEndLocation.value || endLocationId.value)
  
  // The gameLocations are different
  const differentGameLocations =
    (selectedStartLocation.value?.id !== selectedEndLocation.value?.id) &&
    (startLocationId.value !== endLocationId.value)
  
  // We have a quest title
  const hasTitle = questTitle.value.trim() !== ''
  
  return hasStartLocation && hasEndLocation && differentGameLocations && hasTitle
})

// Helper functions for the PickerComponent
function updateStartGameLocation(gameLocation: GameLocation | string) {
  console.log('Setting start gameLocation:', gameLocation)
  
  // If we're getting an ID instead of a GameLocation object
  if (typeof gameLocation === 'string') {
    startLocationId.value = gameLocation
    const found = locationStore.locations.find((p:GameLocation) => p.id === gameLocation)
    if (found) {
      selectedStartLocation.value = found
    }
  } else {
    selectedStartLocation.value = gameLocation
    startLocationId.value = gameLocation.id
  }
}

function updateEndGameLocation(gameLocation: GameLocation | string) {
  console.log('Setting end gameLocation:', gameLocation)
  
  // If we're getting an ID instead of a GameLocation object
  if (typeof gameLocation === 'string') {
    endLocationId.value = gameLocation
    const found = locationStore.locations.find((p:GameLocation) => p.id === gameLocation)
    if (found) {
      selectedEndLocation.value = found
    }
  } else {
    selectedEndLocation.value = gameLocation
    endLocationId.value = gameLocation.id
  }
}

// Watch for changes in selected gameLocation and quest title to help debug
watch([selectedStartLocation, selectedEndLocation, questTitle], () => {
  console.log('Quest state updated:', {
    startGameLocation: selectedStartLocation.value,
    endGameLocation: selectedEndLocation.value,
    title: questTitle.value,
    canStart: canStartQuest.value
  })
}, { deep: true })

// Toggle between light and dark themes
function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}

async function callStartQuest() {
  if (canStartQuest.value) {
    console.log('Starting quest...')
    
    // Make sure we have the full gameLocation objects
    let startGameLocation = selectedStartLocation.value
    let endGameLocation = selectedEndLocation.value
    
    // If we only have IDs, find the full gameLocation objects
    if (!startGameLocation && startLocationId.value) {
      startGameLocation = locationStore.locations.find((p:GameLocation) => p.id === startLocationId.value) || null
    }
    
    if (!endGameLocation && endLocationId.value) {
      endGameLocation = locationStore.locations.find((p:GameLocation) => p.id === endLocationId.value) || null
    }
    
    // Check that we have valid gameLocation objects
    if (!startGameLocation || !endGameLocation) {
      console.error('Failed to find gameLocations', { startGameLocationId: startLocationId.value, endGameLocationId: endLocationId.value })
      return
    }
    
    // Change screen
    appStore.setScreen('intro')
    
    let difficulty = 1
    if (selectedDifficulty.value === 'hard') { difficulty = 1.5 }
    if (selectedDifficulty.value === 'easy') { difficulty = 0.66 }
    
    await startQuest(
      questTitle.value,
      startGameLocation as GameLocation,
      endGameLocation as GameLocation,
      difficulty,
      playerCount.value
    );
  }
}

// Load gameLocations when the component is mounted
onMounted(() => {
  console.log('mounted QuestStartScreen')
  locationStore.fetchNearbyGameLocations()
})
</script>

<style scoped>
.quest-start-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  padding: 2rem 0;
}

.quest-start-content {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  margin: auto;
}

.theme-toggle {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.theme-button {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.gameLocation-selection {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.gameLocation-selector {
  flex: 1;
  position: relative;
}

.quest-details {
  margin: 2rem 0;
}

.quest-input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
}

.difficulty-selector, .player-count-selector {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.start-quest-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.start-quest-button:hover:not(:disabled) {
  background: #45a049;
}

.start-quest-button:disabled {
  background: #666;
  cursor: not-allowed;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.quest-form {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style> 