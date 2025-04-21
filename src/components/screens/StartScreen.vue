<template>
  <div class="quest-start-screen screen-container" :style="{ background: questStore.getGradient('primary') }">

    <div class="quest-start-content" :style="contentStyle">
      <h2>Start Your Quest</h2>
      
      <div class="theme-toggle">
        <ButtonInput
          @click="questStore.toggleTheme" 
          variant="secondary"
          size="small"
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
            />
          </div>
        </div>
        
        <div class="quest-details">
          <input 
            v-model="questTitle" 
            type="text" 
            placeholder="Quest Title"
            class="quest-input"
            :style="inputStyle"
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
            />
          </div>
          
          <div class="player-count-selector">
            <NumberInput
              v-model="playerCount"
              title="Number of Players"
              :min="1"
              :max="20"
              description="Monsters scale with player count:<br>• Minions: 2× player count<br>• Grunts: 1× player count<br>• Elites: Fixed (1) or scaled on hard difficulty<br>• Bosses: Always 1"
            />
          </div>
          
          <div class="min-locations-selector">
            <NumberInput
              v-model="minimumLocations"
              title="Minimum Locations"
              :min="3"
              description="Minimum number of locations to visit in the quest"
            />
          </div>
        </div>
        
        <div class="start-button-container">
          <ButtonInput
            :action="callStartQuest"
            :locked="!canStartQuest"
            size="large"
            variant="primary"
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
import {computed, onMounted, ref, watch} from 'vue'
import {useAppStore} from '@/stores/appStore'
import {startQuest} from "@/quest/startQuest"
import ListInput from '@/components/forms/ListInput.vue'
import ButtonSet from '@/components/forms/ButtonSet.vue'
import ButtonInput from '@/components/forms/ButtonInput.vue'
import NumberInput from '@/components/forms/NumberInput.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {GameLocation} from "@/types"
import {useLocationStore} from "@/stores/locationStore"
import {useQuestStore} from "@/stores/questStore"
import {generateQuestTitle} from "@/quest/generateQuestTitle"

const appStore = useAppStore()
const locationStore = useLocationStore()
const questStore = useQuestStore()

const selectedStartLocation = ref<GameLocation | null>(null)
const selectedEndLocation = ref<GameLocation | null>(null)
const startLocationId = ref<string>('')
const endLocationId = ref<string>('')
const questTitle = ref(generateQuestTitle())
const isLoading = ref(true)
const selectedDifficulty = ref('medium')
const playerCount = ref(3)
const minimumLocations = ref(3)

// Theme-based styles
const contentStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('card'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium')
}))

const inputStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium')
}))

// Watch for locations to be loaded
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
  
  // We have locations selected either via objects or IDs
  const hasStartLocation = !!(selectedStartLocation.value || startLocationId.value)
  const hasEndLocation = !!(selectedEndLocation.value || endLocationId.value)
  
  // The locations are different
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
    const found = locationStore.locations.find((p:GameLocation) => p.id === location)
    if (found) {
      selectedStartLocation.value = found
    }
  } else {
    selectedStartLocation.value = location
    startLocationId.value = location.id
  }
}

function updateEndLocation(location: GameLocation | string) {
  console.log('Setting end location:', location)
  
  // If we're getting an ID instead of a GameLocation object
  if (typeof location === 'string') {
    endLocationId.value = location
    const found = locationStore.locations.find((p:GameLocation) => p.id === location)
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

    // Safety check
    if (!startGameLocation || !endGameLocation) {
      console.error('Cannot start quest: Missing locations')
      return
    }

    // Set our quest minimum locations
    questStore.setMinimumLocations(minimumLocations.value)

    // Update the player count
    questStore.setPlayerCount(playerCount.value)

    // Map difficulty setting to numeric value
    let difficultyValue = 1
    if (selectedDifficulty.value === 'easy') difficultyValue = 0
    if (selectedDifficulty.value === 'medium') difficultyValue = 1
    if (selectedDifficulty.value === 'hard') difficultyValue = 2

    questStore.setDifficulty(difficultyValue)

    // Start the quest but don't wait for it to all init
    startQuest(
        questTitle.value,
        startGameLocation,
        endGameLocation,
        playerCount.value,
        difficultyValue,
        minimumLocations.value
    ).then()

    // Transition to intro
    appStore.setScreen('intro')
  }
}

// Load locations when the component is mounted
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
  padding: 2rem;
}

.quest-start-content {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  margin: auto;
}

.quest-start-content h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.quest-form {
  margin-top: 2rem;
}

.location-selection {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.location-selector {
  flex: 1;
  min-width: 250px;
}

.location-selector h3 {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.quest-details {
  margin-bottom: 2rem;
}

.quest-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-width: 1px;
  border-style: solid;
  outline: none;
}

.difficulty-selector,
.player-count-selector,
.min-locations-selector {
  margin-bottom: 1.5rem;
}

.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.start-button-container {
  margin-top: 2rem;
  width: 100%;
}

@media (max-width: 768px) {
  .location-selection {
    flex-direction: column;
  }

  .location-selector {
    width: 100%;
  }
}
</style> 