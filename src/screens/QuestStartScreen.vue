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
        <div class="pub-selection">
          <div class="pub-selector">
            <h3>Start Pub</h3>
            <PickerComponent
              v-model="startPubId"
              :options="pubStore.pubs"
              searchable
              placeholder="Search for a pub..."
              value-property="id"
              display-property="name"
              @selection-change="updateStartPub"
              :theme="currentTheme"
            />
          </div>
          
          <div class="pub-selector">
            <h3>End Pub</h3>
            <PickerComponent
              v-model="endPubId"
              :options="pubStore.pubs"
              searchable
              placeholder="Search for a pub..."
              value-property="id"
              display-property="name"
              @selection-change="updateEndPub"
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
import { usePubStore } from '../stores/pubStore'
import { useAppStore } from '../stores/appStore'
import type { Pub } from "../types"
import { startQuest } from "@/quest/startQuest.ts"
import PickerComponent from '@/components/PickerComponent.vue'
import ButtonPickerComponent from '@/components/ButtonPickerComponent.vue'
import CounterPickerComponent from '@/components/CounterPickerComponent.vue'

const pubStore = usePubStore()
const appStore = useAppStore()

const selectedStartPub = ref<Pub | null>(null)
const selectedEndPub = ref<Pub | null>(null)
const startPubId = ref<string>('')
const endPubId = ref<string>('')
const questTitle = ref('')
const isLoading = ref(true)
const selectedDifficulty = ref('medium')
const playerCount = ref(3)
const currentTheme = ref('light') // Default theme

// Watch for pubs to be loaded
watch(() => pubStore.pubs, (newPubs) => {
  if (newPubs.length > 0) {
    isLoading.value = false
  }
}, { immediate: true })

// Watch for id changes to update the Pub objects
watch([startPubId], () => {
  if (startPubId.value) {
    const pub = pubStore.pubs.find(p => p.id === startPubId.value)
    if (pub) {
      selectedStartPub.value = pub
    }
  } else {
    selectedStartPub.value = null
  }
}, { immediate: true })

watch([endPubId], () => {
  if (endPubId.value) {
    const pub = pubStore.pubs.find(p => p.id === endPubId.value)
    if (pub) {
      selectedEndPub.value = pub
    }
  } else {
    selectedEndPub.value = null
  }
}, { immediate: true })

const canStartQuest = computed(() => {
  // Debug log
  console.log('Checking if can start quest:', {
    selectedStartPub: selectedStartPub.value,
    selectedEndPub: selectedEndPub.value,
    startPubId: startPubId.value,
    endPubId: endPubId.value,
    questTitle: questTitle.value
  })
  
  // We have pubs selected either via objects or IDs
  const hasStartPub = !!(selectedStartPub.value || startPubId.value)
  const hasEndPub = !!(selectedEndPub.value || endPubId.value)
  
  // The pubs are different
  const differentPubs = 
    (selectedStartPub.value?.id !== selectedEndPub.value?.id) &&
    (startPubId.value !== endPubId.value)
  
  // We have a quest title
  const hasTitle = questTitle.value.trim() !== ''
  
  return hasStartPub && hasEndPub && differentPubs && hasTitle
})

// Helper functions for the PickerComponent
function updateStartPub(pub: Pub | string) {
  console.log('Setting start pub:', pub)
  
  // If we're getting an ID instead of a Pub object
  if (typeof pub === 'string') {
    startPubId.value = pub
    const found = pubStore.pubs.find(p => p.id === pub)
    if (found) {
      selectedStartPub.value = found
    }
  } else {
    selectedStartPub.value = pub
    startPubId.value = pub.id
  }
}

function updateEndPub(pub: Pub | string) {
  console.log('Setting end pub:', pub)
  
  // If we're getting an ID instead of a Pub object
  if (typeof pub === 'string') {
    endPubId.value = pub
    const found = pubStore.pubs.find(p => p.id === pub)
    if (found) {
      selectedEndPub.value = found
    }
  } else {
    selectedEndPub.value = pub
    endPubId.value = pub.id
  }
}

// Watch for changes in selected pubs and quest title to help debug
watch([selectedStartPub, selectedEndPub, questTitle], () => {
  console.log('Quest state updated:', {
    startPub: selectedStartPub.value,
    endPub: selectedEndPub.value,
    title: questTitle.value,
    canStart: canStartQuest.value
  })
}, { deep: true })

function selectDifficulty(difficulty: string) {
  selectedDifficulty.value = difficulty
}

// Toggle between light and dark themes
function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}

async function callStartQuest() {
  if (canStartQuest.value) {
    console.log('Starting quest...')
    
    // Make sure we have the full pub objects
    let startPub = selectedStartPub.value
    let endPub = selectedEndPub.value
    
    // If we only have IDs, find the full pub objects
    if (!startPub && startPubId.value) {
      startPub = pubStore.pubs.find(p => p.id === startPubId.value) || null
    }
    
    if (!endPub && endPubId.value) {
      endPub = pubStore.pubs.find(p => p.id === endPubId.value) || null
    }
    
    // Check that we have valid pub objects
    if (!startPub || !endPub) {
      console.error('Failed to find pubs', { startPubId: startPubId.value, endPubId: endPubId.value })
      return
    }
    
    // Change screen
    appStore.setScreen('intro')
    
    let difficulty = 1
    if (selectedDifficulty.value === 'hard') { difficulty = 1.5 }
    if (selectedDifficulty.value === 'easy') { difficulty = 0.66 }
    
    await startQuest(
      questTitle.value,
      startPub as Pub,
      endPub as Pub,
      difficulty,
      playerCount.value
    );
  }
}

// Load pubs when the component is mounted
onMounted(() => {
  console.log('mounted QuestStartScreen')
  pubStore.fetchNearbyPubs()
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

.pub-selection {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.pub-selector {
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