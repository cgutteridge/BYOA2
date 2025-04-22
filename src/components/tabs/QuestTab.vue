<template>
  <div class="quest-tab">
    <h2>Current Quest</h2>
    
    <div class="quest-details">
      <div class="quest-title" :style="titleStyle">{{ questStore.title }}</div>
      <div class="quest-description" :style="descriptionStyle">{{ questStore.description }}</div>

      <div class="token-status" :style="tokenStatusStyle" v-if="questStore.title">
        <template v-if="inventoryStore.tokenCount >= questStore.minimumLocations">
          You have all the {{ questStore.tokenTitle }} required to enter {{ questStore.endGameLocation?.name || 'the final location' }}.
        </template>
        <template v-else>
          You have {{ inventoryStore.tokenCount || 'none'}} of the required {{ questStore.minimumLocations }} {{ questStore.tokenTitle }} to enter {{ questStore.endGameLocation?.name || 'the final location' }}.
        </template>
      </div>

      <div class="quest-stats" :style="statsStyle">
        <div class="stat-group">
          <div class="stat-label">Experience Points:</div>
          <div class="stat-value">{{ questStore.xp }}</div>
        </div>
        
        <div class="stat-group">
          <div class="stat-label">Approximate Alcohol Units:</div>
          <div class="stat-value">{{ formatUnits(questStore.booze) }}</div>
        </div>
        
        <div class="stat-group">
          <div class="stat-label">Approximate Soft Drinks:</div>
          <div class="stat-value">{{ formatUnits(questStore.soft) }}</div>
        </div>
        
        <div class="stat-group">
          <div class="stat-label">Approximate Player Count:</div>
          <div class="stat-value">{{ questStore.playerCount }}</div>
        </div>
      </div>

      <div class="quest-locations" :style="locationsStyle">
        <div class="location">
          <div class="location-label">Start Location:</div>
          <div class="location-value">{{ questStore.startGameLocation?.name || 'Unknown' }}</div>
        </div>
        
        <div class="location">
          <div class="location-label">Current Location:</div>
          <div class="location-value">{{ questStore.currentGameLocation?.name || 'Not in a location' }}</div>
        </div>
        
        <div class="location">
          <div class="location-label">Final Location:</div>
          <div class="location-value">{{ questStore.endGameLocation?.name || 'Unknown' }}</div>
        </div>
      </div>
    </div>

    <div v-if="questStore.isDebugMode" class="monster-type-stats">
      <MonsterTypeStats />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuestStore } from '@/stores/questStore'
import MonsterTypeStats from '@/components/MonsterTypeStats.vue'
import { useInventoryStore } from '@/stores/inventoryStore'

// Stores
const questStore = useQuestStore()
const inventoryStore = useInventoryStore()

// Computed styles
const titleStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

const descriptionStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))

const statsStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light'),
}))

const locationsStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light'),
}))

const tokenStatusStyle = computed(() => ({
  color: questStore.getTextColor('accent'),
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('accent'),
}))

// Helper function to format booze without decimal for whole numbers
function formatUnits(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(1)
}
</script>

<style scoped>
.quest-tab h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
}

.quest-details {
  max-width: 800px;
  margin: 0 auto;
}

.quest-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.quest-description {
  margin-bottom: 2rem;
  font-style: italic;
  text-align: center;
}

.quest-stats,
.quest-locations {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.token-status {
  margin-bottom: 2rem;
  padding: 1rem;
  text-align: center;
  font-weight: 500;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1px solid;
}

.stat-group,
.location {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}

.stat-group:not(:last-child),
.location:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label,
.location-label {
  font-weight: 500;
}
</style> 
