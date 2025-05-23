<template>
  <div class="quest-start-screen screen-container" :style="{ background: questStore.getGradient('primary') }">

    <div class="quest-start-content" :style="contentStyle">
      <h2>Start Your Quest</h2>
      <h3>The quest for</h3>
      <input
          v-model="questTitle"
          type="text"
          placeholder="Quest Title"
          class="quest-input"
          :style="inputStyle"
      />

      <div class="theme-toggle">
        <ButtonInput
            @click="questStore.toggleTheme"
            variant="secondary"
            size="small"
        >
          {{ questStore.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode' }}
        </ButtonInput>

        <ButtonInput
            @click="questStore.toggleDebugMode"
            variant="secondary"
            size="small"
            class="debug-toggle"
        >
          {{ questStore.isDebugMode ? '🐞 Debug: ON' : '🐞 Debug: OFF' }}
        </ButtonInput>
      </div>

      <LoadingSpinner v-if="isLoading" message="Loading locations from Open Streetmap..."/>

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
                :show-subtitle="true"
                :subtitle-fn="formatLocationSubtitle"
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
                :show-subtitle="true"
                :subtitle-fn="formatLocationSubtitle"
                @selection-change="updateEndLocation"
            />
          </div>
        </div>

        <div class="quest-details">


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
            />
          </div>

          <div class="min-locations-selector">
            <NumberInput
                v-model="minimumLocations"
                title="Minimum Locations"
                :min="0"
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
import { formatLocationSubtitle } from '@/utils/formatLocation'

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
}, {immediate: true})

// Watch for id changes to update the location objects
watch([startLocationId], () => {
  if (startLocationId.value) {
    const location = locationStore.locations.find((p: GameLocation) => p.id === startLocationId.value)
    if (location) {
      selectedStartLocation.value = location
    }
  } else {
    selectedStartLocation.value = null
  }
}, {immediate: true})

watch([endLocationId], () => {
  if (endLocationId.value) {
    const location = locationStore.locations.find((p: GameLocation) => p.id === endLocationId.value)
    if (location) {
      selectedEndLocation.value = location
    }
  } else {
    selectedEndLocation.value = null
  }
}, {immediate: true})

const canStartQuest = computed(() => {

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
function updateStartLocation(location: GameLocation | string | null) {
  // console.log('Setting start location:', location)
  if (location === null) {
    selectedStartLocation.value = null
    startLocationId.value = ''
    return
  }

  // If we're getting an ID instead of a GameLocation object
  if (typeof location === 'string') {
    startLocationId.value = location
    const found = locationStore.locations.find((p: GameLocation) => p.id === location)
    if (found) {
      selectedStartLocation.value = found
    }
  } else {
    selectedStartLocation.value = location
    startLocationId.value = location.id
  }
}

function updateEndLocation(location: GameLocation | string | null) {
  // console.log('Setting end location:', location)
  if (location === null) {
    selectedEndLocation.value = null
    endLocationId.value = ''
    return
  }

  // If we're getting an ID instead of a GameLocation object
  if (typeof location === 'string') {
    endLocationId.value = location
    const found = locationStore.locations.find((p: GameLocation) => p.id === location)
    if (found) {
      selectedEndLocation.value = found
    }
  } else {
    selectedEndLocation.value = location
    endLocationId.value = location.id
  }
}

async function callStartQuest() {
  if (!canStartQuest.value) {
    return
  }
  // console.log('Starting quest...')

  // Make sure we have the full location objects
  let startGameLocation = selectedStartLocation.value
  let endGameLocation = selectedEndLocation.value

  // If we only have IDs, find the full location objects
  if (!startGameLocation && startLocationId.value) {
    startGameLocation = locationStore.locations.find((p: GameLocation) => p.id === startLocationId.value) || null
  }

  if (!endGameLocation && endLocationId.value) {
    endGameLocation = locationStore.locations.find((p: GameLocation) => p.id === endLocationId.value) || null
  }

  // Safety check
  if (!startGameLocation || !endGameLocation) {
    console.error('Cannot start quest: Missing locations')
    return
  }

  // Map difficulty setting to numeric value
  let difficultyValue = 1
  if (selectedDifficulty.value === 'easy') difficultyValue = 0
  if (selectedDifficulty.value === 'medium') difficultyValue = 1
  if (selectedDifficulty.value === 'hard') difficultyValue = 2

  // Start the quest but don't wait for it to all init
  startQuest(
      questTitle.value,
      startGameLocation,
      endGameLocation,
      difficultyValue,
      playerCount.value,
      minimumLocations.value
  ).then()

  // Transition to intro
  appStore.setScreen('intro')
}

// Load locations when the component is mounted
onMounted(() => {
  // console.log('mounted StartScreen')
  locationStore.fetchNearbyGameLocations()
})
</script>

<style scoped>
.quest-start-screen {
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quest-start-content {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

.quest-start-content h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.quest-start-content h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
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
  text-align: center;
}

.quest-details {
  margin-bottom: 2rem;
}

.quest-input {
  width: 100%;
  padding: 1rem 0;
  font-size: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-width: 1px;
  border-style: solid;
  outline: none;
  text-align: center;
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
  display: flex;
  gap: 0.5rem;
}

.debug-toggle {
  background-color: rgba(255, 0, 0, 0.05);
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