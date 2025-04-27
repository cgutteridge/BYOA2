<template>
  <div class="location-popup" :style="popupStyle">
    <div class="location-header">
      <div class="location-icon" v-if="type">
        <img :src="`./icons/${type.filename}`" :alt="type.title" />
      </div>
      <h2>
        <template v-if="!location.scouted"> {{ type.title }} at</template>
        {{ location.name }}
      </h2>
    </div>
    <div class="location-status-badges">
      <div class="distance-info" v-if="playerDistance !== null">
        <span>{{ formattedDistance }}</span>
      </div>
      <div class="status-badge visited-badge" v-if="location.hasBeenVisited" :style="badgeStyle">
        Visited
      </div>
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
          v-if="!location.scouted && !isInScoutRange && questStore.isDebugMode && !isLoading"
          :action="scoutLocationAction"
          class="scout-button debug-button"
          variant="secondary"
          size="medium"
      >
        Scout (DEBUG)
      </ButtonInput>

      <!-- Scouted locations -->
      <ButtonInput
          v-if="location.scouted && isEnterRange && (!isEndLocation || hasEnoughTokens)"
          :action="enterLocation"
          class="enter-button"
          variant="primary"
          size="medium"
      >
        Enter Location
      </ButtonInput>

      <ButtonInput
          v-if="location.scouted && questStore.isDebugMode"
          :action="enterLocation"
          class="enter-button debug-button"
          variant="secondary"
          size="medium"
      >
        Enter Location (DEBUG)
      </ButtonInput>
    </div>

    <!-- Token requirement message for end location -->
    <div v-if="showTokenRequirementsMessage" class="token-requirement-message" :style="tokenRequirementStyle">
      You need {{ questStore.minimumLocations }} {{ questStore.tokenTitle }} to enter this location, but you
      {{ inventoryStore.tokenCount < 1 ? "have none" : "only have " + inventoryStore.tokenCount }}.
    </div>

    <div class="location-details">
      <div v-if="location.scouted && location.description">
        <div v-if="location.giftItem" class="gift-info" :style="sectionStyle">
          <h3>Item available :</h3>
          <ItemCard
              :item="location.giftItem"
              variant="gift"
              :show-details="true"
          />
        </div>
        <div v-if="location.wares" class="gift-info" :style="sectionStyle">
          <h3>Wares:</h3>
          <div v-for="item in location.wares" style="margin-bottom: 0.5rem">
            <ItemCard
                :item="item"
                variant="gift"
                :show-details="true"
            />
          </div>
        </div>

        <template v-if="location.type !=='stash' && location.type !=='shop'">
          <h3 class="monsters-heading">Active Enemies:</h3>

          <!-- Show a message when all monsters are defeated -->
          <div v-if="allMonstersDefeated" class="all-defeated-message" :style="messageStyle">
            All enemies have been defeated!
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
                  <div class="monster-title">{{ getMonsterTitle(group) }}</div>
                  <div class="monster-subinfo">{{ getMonsterSpecies(group.type) }} {{
                      getMonsterLevel(group.type)
                    }}{{ getMonsterTraits(group.type) }}
                  </div>
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

        </template><!-- end of enemies section -->

      </div>

      <!-- Loading state when scouting -->
      <LoadingSpinner v-else-if="isLoading" message="Scouting Location..."/>

    </div>

  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {GameLocation, GameLocationType, Monster, MonsterTypeId} from '../../types'
import {useAppStore} from "../../stores/appStore.ts"
import {useQuestStore} from "../../stores/questStore.ts"
import {useInventoryStore} from "@/stores/inventoryStore.ts"
import {useLocationStore} from "@/stores/locationStore.ts"
import {monsterTypes} from '../../data/monsterTypes.ts'
import calculateDistance from '@/utils/calculateDistance.ts'
import formatDistance from '@/utils/formatDistance.ts'
import ItemCard from '../ItemCard.vue'
import ButtonInput from '@/components/forms/ButtonInput.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {locationTypesById} from "@/data/locationTypes.ts";
import {scoutLocation} from "@/quest/scoutLocation.ts";
import {generateTokenItem} from "@/quest/itemUtils.ts";
import {getMonsterXP} from "../../quest/monsterUtils.ts";
import '@/styles/monsterAnimations.css'

const props = defineProps<{
  location: GameLocation
}>()

const appStore = useAppStore()
const questStore = useQuestStore()
const inventoryStore = useInventoryStore()
const locationStore = useLocationStore()

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

const tokenRequirementStyle = computed(() => ({
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

const formattedDistance = computed(() => {
  if (playerDistance.value === null) return '';
  return formatDistance(playerDistance.value);
});

// Check if player is within scout range
const isInScoutRange = computed(() => {
  return playerDistance.value !== null && playerDistance.value <= questStore.scoutRange;
});

// Check if player is within enter range (25m)
const isEnterRange = computed(() => {
  return playerDistance.value !== null && playerDistance.value <= 25;
});

// Check if location is the end location
const isEndLocation = computed(() => {
  return props.location.id === questStore.endGameLocationId;
});

// Check if player has enough tokens for the end location
const hasEnoughTokens = computed(() => {
  return inventoryStore.tokenCount >= questStore.minimumLocations;
});

// Check if we should show the token requirements message for end location
const showTokenRequirementsMessage = computed(() => {
  return isEndLocation.value && !hasEnoughTokens.value;
});

type MonsterGroup = {
  type: MonsterTypeId,
  monsters: Monster[]
}

// Group undefeated monsters by type for display
const groupedMonsters = computed(() => {
  if (!props.location?.monsters || !props.location.monsters.length) {
    return [];
  }

  // Group undefeated monsters by type
  const monstersByType = new Map<string, MonsterGroup>();

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

function getMonsterTitle(group: MonsterGroup): string {
  if (group.monsters.length === 1) {
    return group.monsters[0].name
  }
  const monsterType = monsterTypes.find(m => m.id === group.type)

  return monsterType?.title || group.type
}

function getMonsterDrink(monsterId: string): string {
  const monsterType = monsterTypes.find(m => m.id === monsterId)
  return monsterType?.drink || "Unknown"
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monsterType = monsterTypes.find(m => m.id === monsterId)
  if (!monsterType) return {}

  const classes: Record<string, boolean> = {}

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

  // Award XP for scouting a location through the UI (using logAndNotifyQuestEvent)
  questStore.logAndNotifyQuestEvent(`Scouted ${props.location.name}.`, {xp: 1});
}

function enterLocation(event?: MouseEvent) {
  if (event) {
    event.stopPropagation()
  }

  // Set current game location
  questStore.setCurrentGameLocation(props.location.id)
  appStore.setScreen('location')

  // Check if this is the first time visiting this location
  const isFirstVisit = !props.location.hasBeenVisited

  // Set hasBeenVisited flag to true
  locationStore.setHasBeenVisited(props.location.id, true)

  // Award XP for arriving at a location
  questStore.logAndNotifyQuestEvent(`Entered ${props.location.name}.`, {xp: 2});

  // Award additional XP for first-time visit
  if (isFirstVisit) {
    questStore.logAndNotifyQuestEvent(`First time visiting ${props.location.name}.`, {xp: 3});
  }
}

// Add a computed style for the status badges
const badgeStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  color: questStore.getTextColor('secondary'),
  borderColor: questStore.getBorderColor('light')
}))

</script>

<style scoped>
.location-popup {
  max-width: 90vw;
  color: v-bind('questStore.getTextColor("primary")');
}

.location-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.location-icon {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.location-icon img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.location-popup h2 {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.75rem;
  font-weight: 600;
  flex-grow: 1;
  color: v-bind('questStore.getTextColor("primary")');
}

.location-status-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid v-bind('questStore.getBorderColor("light")');
  background-color: v-bind('questStore.getBackgroundColor("secondary")');
  color: v-bind('questStore.getTextColor("secondary")');
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.visited-badge {
  font-weight: 500;
}

.distance-info {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: v-bind('questStore.getTextColor("secondary")');
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.token-requirement-message {
  text-align: center;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  border: 1px solid v-bind('questStore.getBorderColor("light")');
  background-color: v-bind('questStore.getBackgroundColor("tertiary")');
  color: v-bind('questStore.getTextColor("secondary")');
  font-weight: 500;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.location-details {
  margin-top: 1rem;
}

.gift-info, .prize-info {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid v-bind('questStore.getBorderColor("light")');
  background-color: v-bind('questStore.getBackgroundColor("tertiary")');
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.gift-info h3, .prize-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: v-bind('questStore.getTextColor("primary")');
}

.monsters-heading {
  margin: 1.5rem 0 1rem;
  font-size: 1.25rem;
  color: v-bind('questStore.getTextColor("primary")');
}

.all-defeated-message {
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
  font-style: italic;
  border-radius: 8px;
  border: 1px solid v-bind('questStore.getBorderColor("light")');
  background-color: v-bind('questStore.getBackgroundColor("tertiary")');
  color: v-bind('questStore.getTextColor("secondary")');
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.defeated-enemies-info {
  text-align: center;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  border: 1px solid v-bind('questStore.getBorderColor("light")');
  background-color: v-bind('questStore.getBackgroundColor("tertiary")');
  color: v-bind('questStore.getTextColor("secondary")');
  font-weight: 500;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.monster-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.monster-card {
  border-radius: 8px;
  border: 1px solid v-bind('questStore.getBorderColor("medium")');
  overflow: hidden;
  display: flex;
  padding: 0;
  transition: border-color 0.3s ease;
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
  color: #ffffff;
}

.monster-info {
  flex: 1;
  padding: 1rem;
}

.monster-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
  color: v-bind('questStore.theme === "dark" ? "#ffffff" : "#000000"');
}

.monster-subinfo {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: v-bind('questStore.theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)"');
}

.monster-xp {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: v-bind('questStore.getTextColor("accent")');
}

.monster-details {
  font-size: 0.9rem;
  color: v-bind('questStore.theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"');
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
  border: 2px dashed v-bind('questStore.theme === "dark" ? "rgba(200, 50, 50, 0.7)" : "rgba(200, 50, 50, 0.5)"');
  background-color: v-bind('questStore.theme === "dark" ? "rgba(200, 50, 50, 0.2)" : "rgba(200, 50, 50, 0.1)"');
  color: v-bind('questStore.theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"');
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.debug-button:hover {
  background-color: v-bind('questStore.theme === "dark" ? "rgba(200, 50, 50, 0.3)" : "rgba(200, 50, 50, 0.2)"');
}
</style> 