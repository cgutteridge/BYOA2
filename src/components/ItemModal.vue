<template>
  <Teleport to="body">
    <div v-if="isOpen" class="item-inspect-modal">
      <div class="item-inspect-modal__backdrop" :style="backdropStyle" @click="close"></div>

      <div class="item-inspect-modal__content" :style="modalContentStyle">
        <button class="item-inspect-modal__close" :style="closeButtonStyle" @click="close">×</button>

        <!-- Item view -->
          <div class="item-inspect-modal__header" :style="headerStyle">
            <h2 class="item-inspect-modal__title" :style="titleStyle">{{ item.name }}</h2>
            <div class="item-inspect-modal__level" :style="levelStyle">{{ item.uses !== undefined ? `${item.uses} use${item.uses!=1?"s":""} remaining` : 'Unlimited uses' }}</div>
          </div>

        <div class="item-inspect-modal__body">
            <!-- Item description (if available) -->
            <StoryBlock v-if="item.description">
              {{ item.description }}
            </StoryBlock>
            
            <!-- Effect description -->
            <div class="item-inspect-modal__effect" :style="sectionStyle">
              <p :style="textStyle">{{ power.generateEffectDescription(item) }}</p>
            </div>

            <!-- Target selection -->
          <template v-if="hasValidTargets && power.itemTargetType!=='special'">
            <div class="item-inspect-modal__target-section" :style="sectionStyle">
              <h3 :style="sectionHeaderStyle">{{ isChoiceTarget ? 'Choose Target' : '❓ Possible Targets ❓' }}</h3>

              <template v-if="power.itemTargetType==='locations'">
                <div class="target-list">
                  <ListInput
                    v-model="selectedTargetLocations"
                    :options="sortedPotentialTargetLocations.map(location => ({
                      id: location.id,
                      name: `${location.name} (${location.distance})`
                    }))"
                    :multiple="true"
                    :max-selections="power.maxTargets !== undefined ? power.maxTargets : (item.uses || 1)"
                    :always-show="true"
                    :disabled="item.target==='random'"
                  />
                  <div v-if="item.target==='random' && potentialTargetLocations.length > 0" class="random-target-message" :style="sectionStyle">
                    Will choose a random location from {{ potentialTargetLocations.length }} available targets outside scout range.
                  </div>
                  <div v-if="item.target==='random' && potentialTargetLocations.length === 0" class="no-targets-message" :style="noTargetsStyle">
                    No locations available outside your scout range. Try moving to a new area.
                  </div>
                </div>
              </template>

              <template v-if="power.itemTargetType==='monsters'">
                <div v-if="item.target==='pick_type' || item.target==='random_type'" class="target-list">
                  <ListInput
                      v-model="selectedTargetMonsterTypes"
                      :options="potentialTargetMonsterTypes.map(type => ({
                      id: type.id,
                      name: `${getMonsterTitle(type.id)} (${getMonsterLevel(type.id)})`,
                      count: getMonsterCountByType(type.id)
                    }))"
                    :multiple="true"
                    :max-selections="power.maxTargets !== undefined ? power.maxTargets : (item.uses || 1)"
                    :always-show="true"
                      :disabled="item.target==='random_type'"
                  />
                </div>
                <div v-else class="target-list">
                  <ListInput
                      v-model="selectedTargetMonsters"
                      :options="potentialTargetMonsters.map(monster => ({
                      id: monster.id,
                      name: `${monster.name} (${getMonsterSpecies(monster.type)} ${getMonsterLevel(monster.type)})`
                    }))"
                      :multiple="true"
                      :max-selections="power.maxTargets !== undefined ? power.maxTargets : (item.uses || 1)"
                      :always-show="true"
                      :disabled="item.target==='random'"
                  />
                </div>
              </template>

              <p v-else class="no-targets" :style="noTargetsStyle">
                No valid targets available for this item in current location.
              </p>

            </div>
            <!-- Results section (when power has results) -->
            <div v-if="power.hasResults && resultMonsterTypes.length > 0" class="item-inspect-modal__result-section" :style="sectionStyle">
              <h3 :style="sectionHeaderStyle">Select Result</h3>
              <div class="result-list">
                <ListInput
                  v-model="selectedResult"
                  :options="resultMonsterTypes.map(type => ({
                    id: type.id,
                    name: `${getMonsterTitle(type.id)} (${getMonsterLevel(type.id)}) - ${type.drink}`,
                  }))"
                  :multiple="false"
                  :always-show="true"
                />
              </div>
            </div>
            <div v-else-if="power.hasResults" class="item-inspect-modal__result-section" :style="sectionStyle">
              <h3 :style="sectionHeaderStyle">No Available Results</h3>
              <p class="no-results" :style="noTargetsStyle">
                There are no valid results available for this transformation.
              </p>
            </div>
          </template>
          </div>
          <div v-if="canBeUsed" class="item-inspect-modal__footer" :style="footerStyle">
            <button
              class="item-inspect-modal__use-btn"
              :disabled="!(hasValidTargets && formSatisfied)"
              :style="!(hasValidTargets && formSatisfied) ? disabledButtonStyle : useButtonStyle"
              @click="useItem"
            >
              {{ hasValidTargets && formSatisfied ? 'Use Item' : 'No Valid Targets' }}
            </button>
          </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {GameLocation, Item, Monster, MonsterType, toMonsterTypeId} from '../types'
import {useAppStore} from '../stores/appStore'
import {useQuestStore} from '../stores/questStore'
import {
  itemCanBeUsed,
  itemHasValidTargets,
  potentialTargetLocationsForItem,
  potentialTargetMonstersForItem,
  potentialTargetMonstersTypesForItem
} from '../quest/itemUtils.ts'
import {monsterTypes, monsterTypesById} from '../data/monsterTypes.ts'
import {powerFactory} from "@/powers";
import pickOne from "@/utils/pickOne.ts";
import {getMonsterLevel, getMonsterSpecies} from "@/quest/monsterUtils.ts";
import ListInput from "@/components/forms/ListInput.vue";
import StoryBlock from "@/components/StoryBlock.vue";
import calculateDistance from "@/utils/calculateDistance.ts";
import formatDistance from "@/utils/formatDistance.ts";

// Define interface extending GameLocation with distance properties
interface GameLocationWithDistance extends GameLocation {
  distanceValue: number;
  distance: string;
}

// Stores
const appStore = useAppStore()
const questStore = useQuestStore()

// Get modal state from appStore
const isOpen = computed<boolean>(() => appStore.inspectedItem !== null)
const item = computed<Item>(() => appStore.inspectedItem || {} as Item)

const power = computed(()=> powerFactory.getPower(item.value.power))

// State
const selectedTargetMonsters = ref<string[]>([])
const selectedTargetMonsterTypes = ref<string[]>([])
const selectedTargetLocations = ref<string[]>([])
const selectedResult = ref<string>('')

// Placeholder for result monster types - to be implemented later
const resultMonsterTypes = computed<MonsterType[]>(() => {
  if (!power.value || !power.value.hasResults) {
    return [];
  }
  return possibleResults.value;
})

// Get possible result monster types from the power
const possibleResults = computed<MonsterType[]>(() => {
  if (!power.value || !power.value.hasResults) {
    return [];
  }
  
  // Get the selected monster type
  let selectedMonsterType: MonsterType | undefined;
  
  // For type-targeting items
  if (selectedTargetMonsterTypes.value.length > 0) {
    const typeId = selectedTargetMonsterTypes.value[0];
    selectedMonsterType = monsterTypesById[toMonsterTypeId(typeId)];
  } 
  // For individual monster targeting items
  else if (selectedTargetMonsters.value.length > 0) {
    const monsterId = selectedTargetMonsters.value[0];
    const monster = potentialTargetMonsters.value.find(m => m.id === monsterId);
    if (monster) {
      selectedMonsterType = monsterTypesById[monster.type];
    }
  }
  
  // If no monster type is selected yet, return empty array
  if (!selectedMonsterType) {
    return [];
  }
  
  // Pass the selected monster type to the power's getPossibleResults method
  return power.value.getPossibleResults(item.value, selectedMonsterType);
})

// Theme-based styles
const backdropStyle = computed(() => ({
  backgroundColor: questStore.getOverlayColors().background,
}))

const modalContentStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('modal'),
  color: questStore.getTextColor('primary'),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
}))

const closeButtonStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))

const headerStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  borderBottom: `1px solid ${questStore.getBorderColor('light')}`,
}))

const titleStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

const levelStyle = computed(() => ({
  color: questStore.getTextColor('secondary'),
}))

const sectionStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  borderColor: questStore.getBorderColor('light'),
}))

const sectionHeaderStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

const textStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

const noTargetsStyle = computed(() => ({
  backgroundColor: questStore.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  color: questStore.getTextColor('secondary'),
}))

const footerStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  borderTop: `1px solid ${questStore.getBorderColor('light')}`,
}))

const useButtonStyle = computed(() => {
  const colors = questStore.getButtonColors('primary')
  return {
    backgroundColor: colors.background,
    color: colors.text,
    borderColor: colors.border,
  }
})

const disabledButtonStyle = computed(() => {
  const colors = questStore.getButtonColors('disabled')
  return {
    backgroundColor: colors.background,
    color: colors.text,
    borderColor: colors.border,
  }
})

const isChoiceTarget = computed<boolean>(() => {
  return item.value.target === 'pick_type' || item.value.target === 'pick'
})

const potentialTargetMonsterTypes = computed<MonsterType[]>(() => {
  const result = potentialTargetMonstersTypesForItem(item.value, questStore.currentGameLocation);
  return result;
})

const potentialTargetMonsters = computed<Monster[]>(() => {
  const result = potentialTargetMonstersForItem(item.value, questStore.currentGameLocation);
  return result;
})

const potentialTargetLocations = computed<GameLocation[]>(() => {
  const result = potentialTargetLocationsForItem(item.value);
  return result;
})

// New computed property for locations with distances
const sortedPotentialTargetLocations = computed<GameLocationWithDistance[]>(() => {
  const appStore = useAppStore();
  
  if (!appStore.playerCoordinates) {
    return potentialTargetLocations.value.map(location => ({
      ...location,
      distanceValue: 0,
      distance: 'Unknown'
    }));
  }
  
  return potentialTargetLocations.value
    .map(location => {
      const distance = calculateDistance(appStore.playerCoordinates!, location.coordinates);
      return {
        ...location,
        distanceValue: distance,
        distance: formatDistance(distance)
      };
    })
    .sort((a, b) => a.distanceValue - b.distanceValue);
})

const canBeUsed = computed<boolean>(() => {
  const result = itemCanBeUsed(item.value);
  return result;
})

const hasValidTargets = computed<boolean>(() => {

  // For other items, use the standard check
  return itemHasValidTargets(item.value);
})

// true if all the pick elements have been completed
const formSatisfied = computed<boolean>(() => {
  // Skip validation for random location items as long as there are potential targets
  if (power.value.itemTargetType === 'locations' && item.value.target === 'random') {
    const satisfied = potentialTargetLocations.value.length > 0;
    return satisfied;
  }
  
  // For other targeting modes
  let ok = true;
  
  // Special handling for location items with pick mode
  if (power.value.itemTargetType === 'locations' && item.value.target === 'pick') {
    if (selectedTargetLocations.value.length === 0) {
      ok = false;
    }
  }
  
  // Handling for monster items
  if (power.value.itemTargetType === 'monsters') {
    if (item.value.target === 'pick_type' && selectedTargetMonsterTypes.value.length === 0) {
      ok = false;
    }
    if (item.value.target === 'pick' && selectedTargetMonsters.value.length === 0) {
      ok = false;
    }
  }
  
  // Check if a result is required and selected
  if (power.value.hasResults && selectedResult.value === '') {
    ok = false;
  }
  
  return ok
})

// Helper function to get monster count by type
function getMonsterCountByType(type: string): number {
  // Count monsters of the exact type
  const monsters : Monster[] = questStore.currentGameLocation?.monsters || []
  return monsters.filter(monster => monster.type === type && monster.alive).length
}

// Methods
function close() {
  // Reset state when closing
  selectedTargetMonsters.value = []
  selectedTargetMonsterTypes.value = []
  selectedTargetLocations.value = []
  selectedResult.value = ''
  
  // Use appStore to close modal
  appStore.closeItemInspectModal()
}

function useItem(): void {
  let lastTarget : Monster | GameLocation | MonsterType | undefined
  switch (power.value.itemTargetType) {
    case 'special':
      useItemSpecial();
      break;
    case 'locations':
      switch (item.value.target) {
        case 'pick':
          lastTarget = useItemPickLocation();
          break;
        case 'random':
          lastTarget = useItemRandomLocation();
          break;
        default:
          console.warn('Not sure how to use location item')
      }
      break;
    case 'monsters':
      switch (item.value.target) {
        case 'pick':
          lastTarget = useItemPickMonster();
          break;
        case 'random':
          lastTarget = useItemRandomMonster();
          break;
        case 'pick_type':
          lastTarget = useItemPickMonsterType();
          break;
        case 'random_type':
          lastTarget = useItemRandomMonsterType();
          break;
        default:
          console.warn('Not sure how to use monster item')
      }
      break;
    default:
      console.warn('Not sure how to use item')
  }

  close()
  console.log( {lastTarget})
  power.value.afterUse( item.value, lastTarget );
}

function useItemSpecial() {
  power.value.useWithoutTarget(item.value)
}

function useItemRandomLocation() : GameLocation | undefined {

  if (potentialTargetLocations.value.length === 0) {
    const appStore = useAppStore();
    appStore.addNotification('No valid locations found outside scout range. Try moving to a new area.');
    return
  }
  
  const target = pickOne(potentialTargetLocations.value)
  power.value.useOnLocation(item.value, target)
  return target
}

function useItemPickLocation() {
  const targets = potentialTargetLocations.value.filter(
      (location:GameLocation)=>selectedTargetLocations.value.includes(location.id))
  targets.forEach(location => {
    power.value.useOnLocation(item.value, location)
  })
  return targets[targets.length - 1]
}

function useItemRandomMonster() {
  const target = pickOne(potentialTargetMonsters.value)
  // Include the selected result if the power has results
  if (power.value.hasResults && selectedResult.value) {
    // Pass the selected result monster type id along with the item and target
    const resultMonsterType = monsterTypesById[toMonsterTypeId(selectedResult.value)]
    power.value.useOnMonster(item.value, target, resultMonsterType)
  } else {
    power.value.useOnMonster(item.value, target)
  }
  return target
}

function useItemPickMonster() : Monster | undefined {
  let targets: Monster[] = selectedTargetMonsters.value.map(
      monsterId => potentialTargetMonsters.value.find(monster => monster.id === monsterId) as Monster);
  targets.forEach(monster => {
    // Include the selected result if the power has results
    if (power.value.hasResults && selectedResult.value) {
      // Pass the selected result monster type id along with the item and target
      const resultMonsterType = monsterTypesById[toMonsterTypeId(selectedResult.value)]
      power.value.useOnMonster(item.value, monster, resultMonsterType)
    } else {
      power.value.useOnMonster(item.value, monster)
    }
  })
  return targets[targets.length - 1]
}

function useItemRandomMonsterType() : MonsterType | undefined {
  const target = pickOne(potentialTargetMonsterTypes.value)
  // Include the selected result if the power has results
  if (power.value.hasResults && selectedResult.value) {
    // Pass the selected result monster type id along with the item and target
    const resultMonsterType = monsterTypesById[toMonsterTypeId(selectedResult.value)]
    power.value.useOnMonsterType(item.value, target, resultMonsterType)
  } else {
    power.value.useOnMonsterType(item.value, target)
  }
  return target
}

function useItemPickMonsterType() : MonsterType | undefined {
  const targets: MonsterType[] = selectedTargetMonsterTypes.value.map(
      monsterTypeId => monsterTypesById[toMonsterTypeId(monsterTypeId)])
  targets.forEach(monsterType => {
    // Include the selected result if the power has results
    if (power.value.hasResults && selectedResult.value) {
      // Pass the selected result monster type id along with the item and target
      const resultMonsterType = monsterTypesById[toMonsterTypeId(selectedResult.value)]
      power.value.useOnMonsterType(item.value, monsterType, resultMonsterType)
    } else {
      power.value.useOnMonsterType(item.value, monsterType)
    }
  })
  return targets[targets.length - 1]
}

// Add this function to get monster title
function getMonsterTitle(typeId: string): string {
  const monsterType = monsterTypes.find(mt => mt.id === typeId)
  return monsterType ? monsterType.title : typeId.charAt(0).toUpperCase() + typeId.slice(1).replace(/_/g, ' ')
}

// Reset the selected result when target selections change
watch([selectedTargetMonsters, selectedTargetMonsterTypes], () => {
  selectedResult.value = '';
});

</script>

<style scoped>
.item-inspect-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.item-inspect-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(2px);
}

.item-inspect-modal__content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
  text-align: center;
}

.item-inspect-modal__close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0 8px;
  z-index: 10;
}

.item-inspect-modal__close:hover {
  opacity: 0.8;
}

.item-inspect-modal__header {
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 5;
}

.item-inspect-modal__title {
  margin: 0 0 5px 0;
  font-size: 1.6rem;
  text-align: center;
}

.item-inspect-modal__level {
  font-size: 0.9rem;
  text-align: center;
}

.item-inspect-modal__body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(100vh - 130px); /* Account for header and footer */
  text-align: center;
}

.item-modal-view, .item-results-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-inspect-modal__effect,
.item-inspect-modal__target-section,
.item-inspect-modal__result-section,
.results-content {
  margin-bottom: 1rem;
  padding: 0 15px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  text-align: center;
}

.item-inspect-modal__effect h3,
.item-inspect-modal__target-section h3,
.item-inspect-modal__result-section h3,
.results-content h3 {
  margin-top: 0;
  font-size: 1.2rem;
}

.item-inspect-modal__effect p,
.item-modal-view p,
.item-results-view p {
  text-align: center;
}

.item-inspect-modal__targeting {
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 8px;
}

.targeting-label {
  font-weight: bold;
}

.uses-count {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
}

.item-inspect-modal__footer {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  position: sticky;
  bottom: 0;
  z-index: 5;
}

.item-inspect-modal__use-btn,
.item-inspect-modal__close-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item-inspect-modal__use-btn:hover:not(:disabled),
.item-inspect-modal__close-btn:hover {
  opacity: 0.9;
}

.item-inspect-modal__use-btn:disabled {
  cursor: not-allowed;
}

.target-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visual-result {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.effect-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 20px 0;
}

.effect-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #555;
  opacity: 0.8;
  animation: pulse 2s infinite ease-in-out;
}

.effect-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(85, 85, 85, 0.6) 0%, rgba(85, 85, 85, 0) 70%);
  animation: glow 3s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
}

@keyframes glow {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
}

/* Target selection styles */
.target-list, .result-list {
  margin: 0.5rem 0;
  border-radius: 8px;
  padding-bottom: 1rem;  /* Add padding to create space below the list */
}

.target-description {
  margin-bottom: 1rem;
  font-style: italic;
  font-size: 0.9rem;
}

.no-targets, .no-results {
  padding: 1rem;
  border-radius: 8px;
  margin: 0.5rem 0;
  font-style: italic;
}

/* Media queries for responsive design */
@media screen and (min-width: 768px) {
  .item-inspect-modal__content {
    width: 90%;
    max-width: 700px;
    height: 90%;
    max-height: 90vh;
    margin: auto;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  .item-inspect-modal__body {
    max-height: calc(90vh - 130px);
  }
}

/* Mobile full screen styles */
@media screen and (max-width: 767px) {
  .item-inspect-modal__content {
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .item-inspect-modal__header {
    padding: 15px 10px;
  }
  
  .item-inspect-modal__body {
    padding: 15px 10px;
  }
  
  .item-inspect-modal__title {
    font-size: 1.4rem;
  }
}
</style> 