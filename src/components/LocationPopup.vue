<template>
  <div class="location-popup" :style="popupStyle">
    <h2>{{ location.name }}<template v-if="!location.scouted"> ({{ type.title }})</template></h2>
    <div class="distance-info" v-if="playerDistance !== null">
      <span>{{ Math.round(playerDistance) }}m away</span>
    </div>
    <div class="action-buttons">
      <!-- Unscouted locations -->
      <ButtonInput 
        v-if="!location.scouted && isInScoutRange && !isLoading"
        :action="scoutLocationAction"
        class="scout-button"
        variant="primary"
        size="medium"
      >
        Scout Location
      </ButtonInput>
      
      <ButtonInput 
        v-if="!location.scouted && !isInScoutRange && appStore.isDebugMode && !isLoading"
        :action="scoutLocationAction"
        class="scout-button debug-button"
        variant="secondary"
        size="medium"
      >
        Scout (DEBUG)
      </ButtonInput>
      
      <!-- Scouted locations -->
      <ButtonInput 
        v-if="location.scouted && isEnterRange"
        :action="enterLocation"
        class="enter-button"
        variant="primary"
        size="medium"
      >
        Enter Location
      </ButtonInput>
      
      <ButtonInput 
        v-if="location.scouted && !isEnterRange && appStore.isDebugMode"
        :action="enterLocation"
        class="enter-button debug-button"
        variant="secondary"
        size="medium"
      >
        Enter Location (DEBUG)
      </ButtonInput>
    </div>
    <div class="location-details">
      <div v-if="location.scouted && location.description">
        <div v-if="location.giftItem" class="gift-info" :style="sectionStyle">
          <h3>Gift:</h3>
          <ItemCard 
            :item="location.giftItem"
            variant="gift"
            :show-details="true"
          />
        </div>
        
        <h3 class="monsters-heading">Active Monsters:</h3>
        
        <!-- Show a message when all monsters are defeated -->
        <div v-if="allMonstersDefeated" class="all-defeated-message" :style="messageStyle">
          All monsters have been defeated!
        </div>
        
        <!-- Group monsters by type and display -->
        <div v-else-if="groupedMonsters.length > 0" class="monster-groups">
          <div v-for="(group, gIndex) in groupedMonsters" :key="gIndex" class="monster-type-group">
            <div 
              class="monster-card"
              :class="getMonsterClasses(group.type)"
              :style="getMonsterStyle(group.type)"
            >
              <div class="monster-count">
                <span>{{ group.monsters.length }}x</span>
              </div>
              <div class="monster-info">
                <div class="monster-title">{{ getMonsterTitle(group.type) }}</div>
                <div class="monster-subinfo">{{ getMonsterSpecies(group.type) }} {{ getMonsterLevel(group.type) }}{{ getMonsterTraits(group.type) }}</div>
                <div class="monster-xp">{{ getMonsterXP(group.type) }} XP</div>
                <div class="monster-details">
                  <div class="monster-stat"><strong>Drink:</strong> {{ getMonsterDrink(group.type) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="location.prizeItem" class="prize-info" :style="sectionStyle">
          <h3>Reward:</h3>
          <div class="prize-item-wrapper">
            <ItemCard 
              :item="location.prizeItem"
              variant="prize"
              :show-details="true"
            />
          </div>
          <div class="prize-item-wrapper" v-if="location.hasToken">
            <ItemCard
                :item="tokenItem"
                variant="prize"
                :show-details="true"
            />
          </div>
        </div>

      </div>
      
      <!-- Loading state when scouting -->
      <LoadingSpinner v-else-if="isLoading" message="Scouting Location..." />

    </div>

  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {GameLocationType, Monster, MonsterTypeId, GameLocation} from '../types'
import {useAppStore} from "../stores/appStore"
import {useQuestStore} from "../stores/questStore"
import {monsterTypes} from '../data/monsterTypes'
import calculateDistance from '@/utils/calculateDistance.ts'
import ItemCard from './ItemCard.vue'
import ButtonInput from '@/components/forms/ButtonInput.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {locationTypesById} from "@/data/locationTypes.ts";
import {scoutLocation} from "@/quest/scoutLocation.ts";
import {generateTokenItem} from "@/quest/itemUtils.ts";
import {getMonsterXP} from "../quest/monsterUtils.ts";

const props = defineProps<{
  location: GameLocation
}>()

const appStore = useAppStore()
const questStore = useQuestStore()

// Theme-based styles
const popupStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('card'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium')
}))

const sectionStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light')
}))

const messageStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('light')
}))

const type = computed((): GameLocationType => locationTypesById[props.location.type])

const playerDistance = computed(() => {
  if (!appStore.playerCoordinates) return null;
  
  return calculateDistance(
    appStore.playerCoordinates,
    props.location.coordinates
  );
});

// Check if player is within scout range
const isInScoutRange = computed(() => {
  return playerDistance.value !== null && playerDistance.value <= questStore.scoutRange;
});

// Check if player is within enter range (25m)
const isEnterRange = computed(() => {
  return playerDistance.value !== null && playerDistance.value <= 25;
});

// Group undefeated monsters by type for display
const groupedMonsters = computed(() => {
  if (!props.location?.monsters || !props.location.monsters.length) {
    return [];
  }
  
  // Group undefeated monsters by type
  const monstersByType = new Map<string, {
    type: MonsterTypeId,
    monsters: Monster[]
  }>();
  
  // Only include monsters that are still alive
  props.location.monsters.forEach(monster => {
    // Skip defeated monsters
    if (!monster.alive) return;
    
    if (!monstersByType.has(monster.type)) {
      monstersByType.set(monster.type, {
        type: monster.type,
        monsters: []
      });
    }
    
    const group = monstersByType.get(monster.type)!;
    group.monsters.push(monster);
  });
  
  // Filter out empty groups
  const nonEmptyGroups = Array.from(monstersByType.values())
    .filter(group => group.monsters.length > 0);
  
  return nonEmptyGroups;
});

// Check if all monsters are defeated
const allMonstersDefeated = computed(() => {
  if (!props.location?.monsters || props.location.monsters.length === 0) {
    return false;
  }
  
  return props.location.monsters.every(monster => !monster.alive);
});

// Compute the token item for this location
const tokenItem = computed(() => {
  return generateTokenItem(props.location);
});

const isLoading = computed(() => {
  return props.location.scouted && !props.location.description;
})

function getMonsterTitle(monsterId: string): string {
  const monsterType = monsterTypes.find(m => m.id === monsterId)

  return monsterType?.title || monsterId
}

function getMonsterDrink(monsterId: string): string {
  const monsterType = monsterTypes.find(m => m.id === monsterId)
  return monsterType?.drink || "Unknown"
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monsterType = monsterTypes.find(m => m.id === monsterId)
  if (!monsterType) return {}

  const classes : Record<string, boolean>= {}

  // Add additional classes from monster style
  if (monsterType.style?.additionalClasses) {
    monsterType.style.additionalClasses.forEach(className => {
      classes[className] = true
    })
  }

  return classes
}

function getMonsterStyle(monsterId: string): Record<string, string> {
  const monsterType = monsterTypes.find(m => m.id === monsterId)
  if (!monsterType || !monsterType.style) return {}
  
  const style: Record<string, string> = {
    backgroundColor: questStore.getBackgroundColor('card'),
    borderColor: questStore.getBorderColor('medium'),
    color: questStore.getTextColor('primary')
  }

  // If monster has style.background, use it
  if (monsterType.style.background) {
    style.background = monsterType.style.background
  }
  
  // If monster has style.backgroundColor, use it (legacy support)
  if (monsterType.style.background) {
    style.background = monsterType.style.background
  }

  // If monster has style.borderColor, use it
  if (monsterType.style.borderColor) {
    style.borderColor = monsterType.style.borderColor
  }
  
  // If monster has style.color, use it
  if (monsterType.style.color) {
    style.color = monsterType.style.color
  }

  // If monster has style.boxShadow, use it
  if (monsterType.style.boxShadow) {
    style.boxShadow = monsterType.style.boxShadow
  }
  
  return style
}

function getMonsterSpecies(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return ""
  
  // Capitalize first letter of species
  return monster.species.charAt(0).toUpperCase() + monster.species.slice(1)
}

function getMonsterLevel(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return ""
  
  // Capitalize first letter of level
  return monster.level.charAt(0).toUpperCase() + monster.level.slice(1)
}

function getMonsterTraits(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.flags || monster.flags.length === 0) return ""
  
  return `, ${monster.flags.join(', ')}`
}

async function scoutLocationAction(event?: MouseEvent) {
  if (event) {
    event.stopPropagation()
  }
  await scoutLocation(props.location)
  
  // Award XP for scouting a location through the UI (using updateStats)
  questStore.updateStats(1, 0, 0, `Scouted ${props.location.name}.`);
}

function enterLocation(event?: MouseEvent) {
  if (event) {
    event.stopPropagation()
  }
  questStore.setCurrentGameLocation(props.location.id)
  appStore.setScreen('location')
  
  // Award XP for arriving at a location (using updateStats)
  questStore.updateStats(2, 0, 0, `Entered ${props.location.name}.`);
}

</script>

<style scoped>
.location-popup {
  position: relative;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 90vw;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid;
}

.location-popup h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.75rem;
  font-weight: 600;
}

.distance-info {
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.location-details {
  margin-top: 1rem;
}

.gift-info, .prize-info {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.gift-info h3, .prize-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.monsters-heading {
  margin: 1.5rem 0 1rem;
  font-size: 1.25rem;
}

.all-defeated-message {
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
  font-style: italic;
  border-radius: 8px;
  border: 1px solid;
}

.monster-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.monster-card {
  border-radius: 8px;
  border: 1px solid;
  overflow: hidden;
  display: flex;
  padding: 0;
}

.monster-count {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  min-width: 3rem;
}

.monster-info {
  flex: 1;
  padding: 1rem;
}

.monster-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.monster-subinfo {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.monster-xp {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.monster-details {
  font-size: 0.9rem;
}

.monster-stat {
  margin-bottom: 0.25rem;
}

.monster-type-group:last-child {
  margin-bottom: 0;
}

.prize-item-wrapper {
  margin-bottom: 1rem;
}

.prize-item-wrapper:last-child {
  margin-bottom: 0;
}

.debug-button {
  border: 2px dashed rgba(200, 50, 50, 0.7);
  background-color: rgba(200, 50, 50, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.debug-button:hover {
  background-color: rgba(200, 50, 50, 0.3);
}
</style> 