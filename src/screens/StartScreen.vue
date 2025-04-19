<template>
  <div class="quest-start-screen screen-container">

    <div class="quest-start-content">
      <h2>Start Your Quest</h2>
      
      <div class="theme-toggle">
        <ButtonInput
          @click="questStore.toggleTheme" 
          variant="secondary"
          size="small"
          :theme="questStore.theme"
        >
          {{ questStore.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode' }}
        </ButtonInput>
      </div>
      
      <LoadingSpinner v-if="isLoading" message="Loading locations from Open Streetmap..." />
      
      <div v-else class="quest-form">
        <div class="location-selection">
          <div class="location-selector">
            <h3>Start Location</h3>
            <ListInput
              v-model="startLocationId"
              :options="locationStore.locations"
              searchable
              placeholder="Search for a location..."
              value-property="id"
              display-property="name"
              @selection-change="updateStartLocation"
              :theme="questStore.theme"
            />
          </div>
          
          <div class="location-selector">
            <h3>End Location</h3>
            <ListInput
              v-model="endLocationId"
              :options="locationStore.locations"
              searchable
              placeholder="Search for a location..."
              value-property="id"
              display-property="name"
              @selection-change="updateEndLocation"
              :theme="questStore.theme"
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
            <ButtonSet
              v-model="selectedDifficulty"
              :options="[
                { id: 'easy', name: 'Easy' },
                { id: 'medium', name: 'Medium' },
                { id: 'hard', name: 'Hard' }
              ]"
              title="Difficulty Level"
              :theme="questStore.theme"
            />
          </div>
          
          <div class="player-count-selector">
            <NumberInput
              v-model="playerCount"
              title="Number of Players"
              :min="1"
              :max="20"
              description="Monsters scale with player count:<br>• Minions: 2× player count<br>• Grunts: 1× player count<br>• Elites: Fixed (1) or scaled on hard difficulty<br>• Bosses: Always 1"
              :theme="questStore.theme"
            />
          </div>
        </div>
        
        <div class="start-button-container">
          <ButtonInput
            :action="callStartQuest"
            :locked="!canStartQuest"
            size="large"
            variant="primary"
            :theme="questStore.theme"
            fullWidth
            class="start-quest-button"
          >
            Start Quest
          </ButtonInput>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../stores/appStore'
import { startQuest } from "@/quest/startQuest.ts"
import ListInput from '@/components/forms/ListInput.vue'
import ButtonSet from '@/components/forms/ButtonSet.vue'
import ButtonInput from '@/components/forms/ButtonInput.vue'
import NumberInput from '@/components/forms/NumberInput.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {GameLocation} from "@/types"
import {useLocationStore} from "@/stores/locationStore.ts"
import {useQuestStore} from "@/stores/questStore.ts"

const appStore = useAppStore()
const locationStore = useLocationStore()
const questStore = useQuestStore()

// For demo purposes, this can be toggled programmatically or based on game state
const lockedStartButton = ref(false)

const selectedStartLocation = ref<GameLocation | null>(null)
const selectedEndLocation = ref<GameLocation | null>(null)
const startLocationId = ref<string>('')
const endLocationId = ref<string>('')
const questTitle = ref('The ring of Badgers')
const isLoading = ref(true)
const selectedDifficulty = ref('medium')
const playerCount = ref(3)

// Watch for gameLocations to be loaded
watch(() => locationStore.locations, (newLocations) => {
  if (newLocations.length > 0) {
    isLoading.value = false
  }
}, { immediate: true })

// Watch for id changes to update the location objects
watch([startLocationId], () => {
  if (startLocationId.value) {
    const location = locationStore.locations.find((p:GameLocation) => p.id === startLocationId.value)
    if (location) {
      selectedStartLocation.value = location
    }
  } else {
    selectedStartLocation.value = null
  }
}, { immediate: true })

watch([endLocationId], () => {
  if (endLocationId.value) {
    const location = locationStore.locations.find((p:GameLocation) => p.id === endLocationId.value)
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

// Helper functions for the ListInput
function updateStartLocation(location: GameLocation | string) {
  console.log('Setting start location:', location)
  
  // If we're getting an ID instead of a GameLocation object
  if (typeof location === 'string') {
    startLocationId.value = location
    const found = locationStore.locations.find((p:GameLocation) => p.id === gameLocation)
    if (found) {
      selectedStartLocation.value = found
    }
  } else {
    selectedStartLocation.value = location
    startLocationId.value = location.id
  }
}

function updateEndLocation(location: GameLocation | string) {
  console.log('Setting end location:', gameLocation)
  
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

// Watch for changes in selected location and quest title to help debug
watch([selectedStartLocation, selectedEndLocation, questTitle], () => {
  console.log('Quest state updated:', {
    startGameLocation: selectedStartLocation.value,
    endGameLocation: selectedEndLocation.value,
    title: questTitle.value,
    canStart: canStartQuest.value
  })
}, { deep: true })

async function callStartQuest() {
  if (canStartQuest.value) {
    console.log('Starting quest...')
    
    // Make sure we have the full location objects
    let startGameLocation = selectedStartLocation.value
    let endGameLocation = selectedEndLocation.value
    
    // If we only have IDs, find the full location objects
    if (!startGameLocation && startLocationId.value) {
      startGameLocation = locationStore.locations.find((p:GameLocation) => p.id === startLocationId.value) || null
    }
    
    if (!endGameLocation && endLocationId.value) {
      endGameLocation = locationStore.locations.find((p:GameLocation) => p.id === endLocationId.value) || null
    }
    
    // Check that we have valid location objects
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
  console.log('mounted StartScreen')
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
  gap: 1rem;
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

.start-button-container {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.start-quest-button {
  min-width: 200px;
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