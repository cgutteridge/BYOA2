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
        <p>Loading locations...</p>
      </div>
      
      <div v-else class="quest-form">
        <div class="location-selection">
          <div class="location-selector">
            <h3>Start Location</h3>
            <PickerComponent
              v-model="startLocationId"
              :options="locationStore.locations"
              searchable
              placeholder="Search for a location..."
              value-property="id"
              display-property="name"
              @selection-change="updateStartLocation"
              :theme="currentTheme"
            />
          </div>
          
          <div class="location-selector">
            <h3>End Location</h3>
            <PickerComponent
              v-model="endLocationId"
              :options="locationStore.locations"
              searchable
              placeholder="Search for a location..."
              value-property="id"
              display-property="name"
              @selection-change="updateEndLocation"
              :theme="currentTheme"
            />
          </div>
        </div>
        
        <div class="quest-details">
          <input 
            v-model="questTitle" 
            type="text" 
            placeholder="Quest Title" 
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
import {useLocationStore} from "@/stores/locationStore.ts";
import {Location} from "@/types";

const appStore = useAppStore()
const locationStore = useLocationStore()

const selectedStartLocation = ref<Location | null>(null)
const selectedEndLocation = ref<Location | null>(null)
const startLocationId = ref<string>('')
const endLocationId = ref<string>('')
const questTitle = ref('The ring of Badgers')
const isLoading = ref(true)
const selectedDifficulty = ref('medium')
const playerCount = ref(3)
const currentTheme = ref<'light' | 'dark'>('light') // Updated with proper type

// Watch for locations to be loaded
watch(() => locationStore.locations, (newLocations) => {
  if (newLocations.length > 0) {
    isLoading.value = false
  }
}, { immediate: true })

// Watch for id changes to update the location objects
watch([startLocationId], () => {
  if (startLocationId.value) {
    const location = locationStore.locations.find(p => p.id === startLocationId.value)
    if (location) {
      selectedStartLocation.value = location
    }
  } else {
    selectedStartLocation.value = null
  }
}, { immediate: true })

watch([endLocationId], () => {
  if (endLocationId.value) {
    const location = locationStore.locations.find(p => p.id === endLocationId.value)
    if (location) {
      selectedEndLocation.value = location
    }
  } else {
    selectedEndLocation.value = null
  }
}, { immediate: true })

const canStartQuest = computed(() => {
  // Debug log
  console.log('Checking if can start quest:', {
    selectedStartLocation: selectedStartLocation.value,
    selectedEndLocation: selectedEndLocation.value,
    startLocationId: startLocationId.value,
    endLocationId: endLocationId.value,
    questTitle: questTitle.value
  })
  
  // We have locations selected either via objects or IDs
  const hasStartLocation = !!(selectedStartLocation.value || startLocationId.value)
  const hasEndLocation = !!(selectedEndLocation.value || endLocationId.value)
  
  // The locations are different
  const differentLocations =
    (selectedStartLocation.value?.id !== selectedEndLocation.value?.id) &&
    (startLocationId.value !== endLocationId.value)
  
  // We have a quest title
  const hasTitle = questTitle.value.trim() !== ''
  
  return hasStartLocation && hasEndLocation && differentLocations && hasTitle
})

// Helper functions for the PickerComponent
function updateStartLocation(location: Location | string) {
  console.log('Setting start location:', location)
  
  // If we're getting an ID instead of a Location object
  if (typeof location === 'string') {
    startLocationId.value = location
    const found = locationStore.locations.find(p => p.id === location)
    if (found) {
      selectedStartLocation.value = found
    }
  } else {
    selectedStartLocation.value = location
    startLocationId.value = location.id
  }
}

function updateEndLocation(location: Location | string) {
  console.log('Setting end location:', location)
  
  // If we're getting an ID instead of a Location object
  if (typeof location === 'string') {
    endLocationId.value = location
    const found = locationStore.locations.find(p => p.id === location)
    if (found) {
      selectedEndLocation.value = found
    }
  } else {
    selectedEndLocation.value = location
    endLocationId.value = location.id
  }
}

// Watch for changes in selected location and quest title to help debug
watch([selectedStartLocation, selectedEndLocation, questTitle], () => {
  console.log('Quest state updated:', {
    startLocation: selectedStartLocation.value,
    endLocation: selectedEndLocation.value,
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
    
    // Make sure we have the full location objects
    let startLocation = selectedStartLocation.value
    let endLocation = selectedEndLocation.value
    
    // If we only have IDs, find the full location objects
    if (!startLocation && startLocationId.value) {
      startLocation = locationStore.locations.find(p => p.id === startLocationId.value) || null
    }
    
    if (!endLocation && endLocationId.value) {
      endLocation = locationStore.locations.find(p => p.id === endLocationId.value) || null
    }
    
    // Check that we have valid location objects
    if (!startLocation || !endLocation) {
      console.error('Failed to find locations', { startLocationId: startLocationId.value, endLocationId: endLocationId.value })
      return
    }
    
    // Change screen
    appStore.setScreen('intro')
    
    let difficulty = 1
    if (selectedDifficulty.value === 'hard') { difficulty = 1.5 }
    if (selectedDifficulty.value === 'easy') { difficulty = 0.66 }
    
    await startQuest(
      questTitle.value,
      startLocation as Location,
      endLocation as Location,
      difficulty,
      playerCount.value
    );
  }
}

// Load locations when the component is mounted
onMounted(() => {
  console.log('mounted QuestStartScreen')
  locationStore.fetchNearbyLocations()
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

.location-selection {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.location-selector {
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