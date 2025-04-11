<template>
  <div class="quest-start-screen">

    <div class="quest-start-content">
      <h2>Start Your Quest</h2>
      
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading locations...</p>
      </div>
      
      <div v-else class="quest-form">
        <div class="pub-selection">
          <div class="pub-selector">
            <h3>Start Pub</h3>
            <input 
              type="text" 
              v-model="startPubSearch" 
              placeholder="Search for a pub..."
              @focus="showStartPubList = true"
              @input="showStartPubList = true"
              class="pub-search"
            />
            <div v-if="showStartPubList && startPubSearch && filteredStartPubs.length > 0" class="pub-list">
              <div 
                v-for="(pub, index) in filteredStartPubs" 
                :key="`start-${pub.id}-${index}`" 
                class="pub-item"
                :class="{ selected: selectedStartPub?.id === pub.id }"
                @click="selectStartPub(pub)"
              >
                {{ pub.name }}
              </div>
            </div>
          </div>
          
          <div class="pub-selector">
            <h3>End Pub</h3>
            <input 
              type="text" 
              v-model="endPubSearch" 
              placeholder="Search for a pub..."
              @focus="showEndPubList = true"
              @input="showEndPubList = true"
              class="pub-search"
            />
            <div v-if="showEndPubList && endPubSearch && filteredEndPubs.length > 0" class="pub-list">
              <div 
                v-for="(pub, index) in filteredEndPubs" 
                :key="`end-${pub.id}-${index}`" 
                class="pub-item"
                :class="{ selected: selectedEndPub?.id === pub.id }"
                @click="selectEndPub(pub)"
              >
                {{ pub.name }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="quest-details">
          <input 
            v-model="questTitle" 
            type="text" 
            placeholder="Quest Title" 
            class="quest-input"
          />
        </div>
        
        <button 
          class="start-quest-button" 
          @click="startQuest" 
          :disabled="!canStartQuest"
        >
          Start Quest
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {usePubStore} from '../stores/pubStore'
import {useAppStore} from '../stores/appStore'
import {useQuestStore} from "../stores/questStore";
import {Pub} from "../types";

const pubStore = usePubStore()
const appStore = useAppStore()
const questStore = useQuestStore()

const selectedStartPub = ref<Pub | null>(null)
const selectedEndPub = ref<Pub | null>(null)
const startPubSearch = ref('')
const endPubSearch = ref('')
const showStartPubList = ref(false)
const showEndPubList = ref(false)
const questTitle = ref('')
const isLoading = ref(true)

// Watch for pubs to be loaded
watch(() => pubStore.pubs, (newPubs) => {
  if (newPubs.length > 0) {
    isLoading.value = false
  }
}, { immediate: true })

const filteredStartPubs = computed(() => {
  if (!startPubSearch.value) return []
  const searchTerm = startPubSearch.value.toLowerCase()
  const uniquePubs = new Set()
  return pubStore.pubs.filter(pub => {
    if (uniquePubs.has(pub.id)) return false
    uniquePubs.add(pub.id)
    return pub.name.toLowerCase().includes(searchTerm)
  })
})

const filteredEndPubs = computed(() => {
  if (!endPubSearch.value) return []
  const searchTerm = endPubSearch.value.toLowerCase()
  const uniquePubs = new Set()
  return pubStore.pubs.filter(pub => {
    if (uniquePubs.has(pub.id)) return false
    uniquePubs.add(pub.id)
    return pub.name.toLowerCase().includes(searchTerm)
  })
})

const canStartQuest = computed(() => {
  return selectedStartPub.value && 
         selectedEndPub.value && 
         selectedStartPub.value.id !== selectedEndPub.value.id &&
         questTitle.value.trim() !== ''
})

function selectStartPub(pub: Pub) {
  selectedStartPub.value = pub
  startPubSearch.value = pub.name
  showStartPubList.value = false
}

function selectEndPub(pub: Pub) {
  selectedEndPub.value = pub
  endPubSearch.value = pub.name
  showEndPubList.value = false
}

async function startQuest() {
  if (canStartQuest.value) {
    console.log('Starting quest...')
    appStore.setScreen('intro')
    await questStore.startQuest(
        questTitle.value,
        selectedStartPub.value as Pub,
        selectedEndPub.value as Pub
    );
    appStore.setScreen('info')
  }
}

// Close dropdowns when clicking outside
onMounted( () => {
  const pubStore = usePubStore()

  console.log('mounted QuestStartScreen')

  pubStore.fetchNearbyPubs()
  
  document.addEventListener('click', (e) => {
    // @ts-ignore
    if (!e.target.closest('.pub-selector')) {
      showStartPubList.value = false
      showEndPubList.value = false
    }
  })
})
</script>

<style scoped>
.quest-start-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
}

.quest-start-content {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
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

.pub-search {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.pub-list {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.pub-item {
  padding: 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.pub-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.pub-item.selected {
  background: #4CAF50;
  color: white;
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