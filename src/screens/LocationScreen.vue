<template>
  <div class="location-screen" :style="{ background: questStore.getBackgroundColor('primary') }">
    <div class="location-header" :style="headerStyle">
      <h2>{{ questStore.currentGameLocation?.name }}</h2>
    </div>

    <!-- GameLocation description section -->
    <div class="location-description-section" v-if="questStore.currentGameLocation?.description">
      <div class="location-description" :style="descriptionStyle">
        {{ questStore.currentGameLocation.description }}
      </div>
    </div>

    <div class="leave-button-container">
      <ButtonInput 
        class="leave-button"
        :action="leaveLocation"
        variant="primary"
        size="medium"
      >
        Leave Location
      </ButtonInput>
    </div>

    <div class="gift-item-section" v-if="questStore.currentGameLocation?.giftItem" :style="sectionStyle">
      <h3><span class="icon">🎁</span> Gift Item Available!</h3>
      <ItemCard 
        :item="questStore.currentGameLocation.giftItem"
        variant="gift"
        :show-details="true"
        @action="claimGiftItem"
      />
    </div>

    <div class="combat-container" v-if="questStore.currentGameLocation?.monsters" :style="combatContainerStyle">
      <!-- All monsters in a 3-column flex layout with active ones first -->
      <div class="monsters-container">
        <template v-for="monster in sortedMonsters" :key="monster.id">
          <div 
            v-if="monster.alive || (monster.item && !monster.alive)"
            class="monster-card"
            :class="[
              monster.alive ? getMonsterClasses(monster.type) : 'item-only', 
              { 
                'defeated': !monster.alive,
                'dying': isMonsterDying(monster.id)
              }
            ]"
            :style="monster.alive ? getMonsterStyle(monster.type) : monsterDefeatStyle"
          >
            <!-- Monster view (only shown when alive) -->
            <template v-if="monster.alive">
              <div class="monster-header">
                <div class="monster-name-container">
                  <div class="monster-name">{{ monster.name }}</div>
                  <div class="monster-subinfo">
                    <span class="monster-info-block">{{ getMonsterTitle(monster.type) }} - {{ getMonsterSpecies(monster.type) }} {{ getMonsterLevel(monster.type) }}</span>
                    <span class="monster-flags" v-if="getMonsterFlags(monster.type).length">
                      <template v-for="(flag, index) in getMonsterFlags(monster.type)" :key="flag">
                        <template v-if="index === 0"> (</template><span class="flag-item">{{ flag }}</span><template v-if="index < getMonsterFlags(monster.type).length - 1">, </template><template v-if="index === getMonsterFlags(monster.type).length - 1">)</template>
                      </template>
                    </span>
                  </div>
                </div>
                <div class="monster-controls">
                  <span 
                    v-if="monster.item" 
                    class="monster-has-item" 
                    title="This monster has an item" 
                    @click="viewItemDetails(monster)"
                  >🎁</span>
                  <button 
                    class="monster-toggle-btn" 
                    :class="{ 
                      'kill-btn': monster.alive && !isMonsterDying(monster.id), 
                      'cancel-btn': isMonsterDying(monster.id),
                      'unkill-btn': !monster.alive 
                    }"
                    :style="getToggleButtonStyle(monster)"
                    @click="toggleMonsterStatus(monster)"
                  >
                    <div class="toggle-content">
                      <div class="toggle-icon">{{ isMonsterDying(monster.id) ? '❌' : (monster.alive ? '☠️' : '🔄') }}</div>
                      <div class="toggle-text">
                        {{ isMonsterDying(monster.id) ? 'Cancel' : (monster.alive ? 'Defeat' : 'Revive') }}
                      </div>
                      <div class="xp-text">{{ getMonsterXP(monster.type) }}&nbsp;XP
                        <template v-if="getMonsterBooze(monster.type)>0">/ {{ formatNumber(getMonsterBooze(monster.type)) }}&nbsp;Booze</template>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              <!-- Monster drink bottom bar -->
              <div class="monster-drink-bar" :style="drinkBarStyle">
                {{ getMonsterDrink(monster.type) }}
              </div>
            </template>
            
            <!-- Item view (only shown when monster is dead and has an item) -->
            <template v-else-if="monster.item">
              <ItemCard 
                :item="monster.item"
                variant="drop"
                :show-details="true"
                @action="claimItem(monster)"
                @contextmenu.prevent="toggleMonsterStatus(monster)"
                title="Right-click to revive monster"
              />
            </template>
          </div>
        </template>
      </div>

      <!-- Prize item section -->
      <div v-if="questStore.currentGameLocation.prizeItem || questStore.currentGameLocation.hasToken" class="prize-item-section" :style="sectionStyle">
        <h3><span class="icon">🏆</span> Quest Prize:</h3>
        <div class="prize-item-wrapper" v-if="questStore.currentGameLocation.prizeItem" >
          <div v-if="!allMonstersDefeated" class="monster-item-locked">
            <span class="lock-icon">🔒</span>
          </div>
          <ItemCard 
            :item="questStore.currentGameLocation.prizeItem"
            variant="prize"
            :show-details="true"
            :locked="!allMonstersDefeated"
            @action="claimPrizeItem"
          />
        </div>
        <div class="prize-item-wrapper" v-if="questStore.currentGameLocation.hasToken">
          <div v-if="!allMonstersDefeated" class="monster-item-locked">
            <span class="lock-icon">🔒</span>
          </div>
          <ItemCard
              :item="tokenItem"
              variant="prize"
              :show-details="true"
              @action="claimTokenItem"
              :locked="!allMonstersDefeated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore";
import {useQuestStore} from "../stores/questStore";
import {monsterTypes} from "../data/monsterTypes";
import {GameLocation, Monster} from "../types";
import '../styles/monsterAnimations.css';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useInventoryStore} from "../stores/inventoryStore";
import {useLocationStore} from "../stores/locationStore";
import ItemCard from "../components/ItemCard.vue";
import ButtonInput from "@/components/forms/ButtonInput.vue";
import {areAllMonstersDefeated, getMonsterBooze, getMonsterSoft, getMonsterXP} from "../quest/monsterUtils.ts";
import formatNumber from "../utils/formatNumber.ts";
import {generateTokenItem} from "@/quest/itemUtils.ts";

// Constants
const MONSTER_DEFEAT_DELAY_MS = 1000;
const transitionDurationSeconds = MONSTER_DEFEAT_DELAY_MS/1000

const questStore = useQuestStore()
const appStore = useAppStore()
const inventoryStore = useInventoryStore()
const locationStore = useLocationStore()

// Keep track of which monsters are currently being defeated (in the countdown)
const monstersDying = ref<Record<string, { timeoutId: number; startTime: number }>>({});

// Theme-based styles
const headerStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  color: questStore.getTextColor('primary'),
  borderBottom: `1px solid ${questStore.getBorderColor('medium')}`,
}))

const descriptionStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  color: questStore.getTextColor('secondary'),
  borderColor: questStore.getBorderColor('light'),
}))

const sectionStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('card'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium'),
}))

const combatContainerStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('secondary'),
  color: questStore.getTextColor('primary'),
  borderColor: questStore.getBorderColor('medium'),
}))

const monsterDefeatStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('medium'),
}))

// Progress animation
let animationFrameId: number | null = null;

// Update the progress of all dying monsters
function updateDyingProgress() {
  if (Object.keys(monstersDying.value).length > 0) {
    // Force Vue to re-render by creating a new reference
    monstersDying.value = { ...monstersDying.value };
  }
  
  // Continue the animation loop if there are still dying monsters
  if (Object.keys(monstersDying.value).length > 0) {
    animationFrameId = requestAnimationFrame(updateDyingProgress);
  } else if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Start the animation loop when a monster starts dying
function startProgressAnimation() {
  if (!animationFrameId && Object.keys(monstersDying.value).length > 0) {
    animationFrameId = requestAnimationFrame(updateDyingProgress);
  }
}

// Cancel the animation loop when component is unmounted
onMounted(() => {
  // Check if we already have dying monsters when component mounts
  if (Object.keys(monstersDying.value).length > 0) {
    startProgressAnimation();
  }
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Clear any remaining timeouts
  Object.keys(monstersDying.value).forEach(monsterId => {
    if (monstersDying.value[monsterId]) {
      window.clearTimeout(monstersDying.value[monsterId].timeoutId);
    }
  });
});

// Keep monsters in their original order rather than sorting based on alive status
const sortedMonsters = computed(() => {
  if (!questStore.currentGameLocation?.monsters || !questStore.currentGameLocation.monsters.length) {
    return [];
  }
  
  // Simply return the monsters array without reordering
  return [...questStore.currentGameLocation.monsters];
});

// Compute whether all monsters are defeated here
const allMonstersDefeated = computed(() => {
  return questStore.currentGameLocation?.monsters
    ? areAllMonstersDefeated(questStore.currentGameLocation.monsters)
    : false
})

// Dynamically generate the regular token item when needed
const tokenItem = computed(() => {
  // when we are in a location the currentLocation will always be set
  return generateTokenItem(questStore.currentGameLocation as GameLocation);
})

function getMonsterTitle(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.title || monsterId
}

function getMonsterDrink(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.drink || "Unknown"
}

function getMonsterSpecies(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return "Unknown"
  
  // Capitalize first letter of species
  return monster.species.charAt(0).toUpperCase() + monster.species.slice(1)
}

function getMonsterLevel(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return "Unknown"
  
  // Capitalize first letter of level
  return monster.level.charAt(0).toUpperCase() + monster.level.slice(1)
}

function getMonsterFlags(monsterId: string): string[] {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.flags) return []
  
  return monster.flags
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return {}

  const classes : Record<string, boolean>= {}

  // Add additional classes from monster style
  if (monster.style?.additionalClasses) {
    monster.style.additionalClasses.forEach(className => {
      classes[className] = true
    })
  }

  return classes
}

function getMonsterStyle(monsterId: string): Record<string, string> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.style) return {}
  
  const style: Record<string, string> = {
    backgroundColor: questStore.getBackgroundColor('card'),
    borderColor: questStore.getBorderColor('medium'),
    color: questStore.getTextColor('primary')
  }

  // If monster has style.background, use it
  if (monster.style.background) {
    style.background = monster.style.background
  }
  
  // If monster has style.backgroundColor, use it (legacy support)
  if (monster.style.background) {
    style.background = monster.style.background
  }

  // If monster has style.borderColor, use it
  if (monster.style.borderColor) {
    style.borderColor = monster.style.borderColor
  }
  
  // If monster has style.color, use it
  if (monster.style.color) {
    style.color = monster.style.color
  }

  // If monster has style.boxShadow, use it
  if (monster.style.boxShadow) {
    style.boxShadow = monster.style.boxShadow
  }
  
  return style
}

function getToggleButtonStyle(monster: Monster): Record<string, string> {
  if (!monster.alive) {
    // Revive button style
    return {
      backgroundColor: questStore.getButtonColors('secondary').background,
      color: questStore.getButtonColors('secondary').text,
      borderColor: questStore.getButtonColors('secondary').border
    }
  } else if (isMonsterDying(monster.id)) {
    // Cancel button style
    return {
      backgroundColor: questStore.getButtonColors('secondary').background,
      color: questStore.getButtonColors('secondary').text,
      borderColor: questStore.getButtonColors('secondary').border
    }
  } else {
    // Defeat button style
    return {
      backgroundColor: questStore.getButtonColors('danger').background,
      color: questStore.getButtonColors('danger').text,
      borderColor: questStore.getButtonColors('danger').border
    }
  }
}

function leaveLocation() {
  appStore.setScreen('map')
  questStore.unsetCurrentGameLocation()
}

function claimItem(monster: Monster) {
  // Only process if monster has an item and is dead
  if (!monster.item || monster.alive) {
    return;
  }
  
  // Add item to inventory
  inventoryStore.addItem(monster.item);
  
  // Award XP based on item level
  if (monster.item.level) {
    const xpToAward = monster.item.level * 2; // 2 XP per item level
    questStore.updateStats(xpToAward, 0, 0, `Claiming ${monster.item.name}`);
  }
  
  // Clear the item from the monster
  if (questStore.currentGameLocation?.monsters) {
    const monsterIndex = questStore.currentGameLocation.monsters.findIndex(m => m.id === monster.id);
    if (monsterIndex !== -1) {
      // Clear the item
      questStore.currentGameLocation.monsters[monsterIndex].item = undefined;
    }
  }
}

function claimPrizeItem() {
  if (allMonstersDefeated.value && questStore.currentGameLocation?.prizeItem) {
    const prizeItem = questStore.currentGameLocation.prizeItem;
    
    // Add to inventory
    inventoryStore.addItem(prizeItem);
    
    // Award XP based on item level
    if (prizeItem.level) {
      const xpToAward = prizeItem.level * 3; // 3 XP per level for prize items
      questStore.updateStats(xpToAward, 0, 0, `Claimed ${prizeItem.name}.`);
    }

    // Remove from location
    delete questStore.currentGameLocation.prizeItem;
  } else {
    // Only show the description if not all monsters are defeated
    if (questStore.currentGameLocation?.prizeItem) {
      appStore.openItemInspectModal(questStore.currentGameLocation.prizeItem);
    }
  }
}

function claimTokenItem() {
  if (allMonstersDefeated.value && tokenItem.value && questStore.currentGameLocation) {
    // Add the token item to the inventory
    inventoryStore.addItem(tokenItem.value);

    // Mark the location as having had its token claimed
    locationStore.setGameLocationHasToken(questStore.currentGameLocation.id, false);

    questStore.updateStats(10, 0, 0, `Claimed ${tokenItem.value.name}.`);
  }
}

function claimGiftItem() {
  if (questStore.currentGameLocation?.giftItem) {
    const giftItem = questStore.currentGameLocation.giftItem;
    
    // Add to inventory
    inventoryStore.addItem(giftItem);
    
    // Award XP based on item level
    if (giftItem.level) {
      const xpToAward = giftItem.level * 2; // 2 XP per level for gift items
      questStore.updateStats(xpToAward, 0, 0, `Claimed ${giftItem.name}.`);
    }
    
    // Remove from GameLocation
    delete questStore.currentGameLocation.giftItem;
  }
}

function viewItemDetails(monster: Monster) {
  if (monster.item) {
    appStore.openItemInspectModal(monster.item);
  }
}

// Function to handle monster status toggling with delay
function toggleMonsterStatus(monster: Monster) {
  if (monster.alive) {
    // Start defeat countdown
    startDefeatCountdown(monster);
  } else {
    // Revive immediately
    reviveMonster(monster);
  }
}

// Start defeat countdown for a monster
function startDefeatCountdown(monster: Monster) {
  // If already dying, cancel the countdown
  if (monstersDying.value[monster.id]) {
    cancelDefeatCountdown(monster);
    return;
  }
  
  const startTime = Date.now();
  
  // Set timeout for defeat
  const timeoutId = window.setTimeout(() => {
    // Actually defeat the monster
    defeatMonster(monster);
    // Remove from dying list
    delete monstersDying.value[monster.id];
  }, MONSTER_DEFEAT_DELAY_MS);
  
  // Add to dying monsters with timeout ID and start time
  monstersDying.value[monster.id] = { timeoutId, startTime };
  
  // Start the animation if not already running
  startProgressAnimation();
}

// Cancel a monster's defeat countdown
function cancelDefeatCountdown(monster: Monster) {
  const dyingInfo = monstersDying.value[monster.id];
  if (dyingInfo) {
    // Clear the timeout
    window.clearTimeout(dyingInfo.timeoutId);
    // Remove from dying list
    delete monstersDying.value[monster.id];
  }
}

// Actually defeat the monster
function defeatMonster(monster: Monster) {
  if (!questStore.currentGameLocation?.monsters) return;

  // Find the monster in the location
  const monsterIndex = questStore.currentGameLocation.monsters.findIndex(m => m.id === monster.id);
  if (monsterIndex === -1) return;

  // Update stats
  const xpToAdd = getMonsterXP(monster.type)
  const unitsToAdd = getMonsterBooze(monster.type)
  const softToAdd = getMonsterSoft(monster.type)
  questStore.updateStats(xpToAdd, unitsToAdd, softToAdd, `Defeated ${monster.name} in combat`);
  // Set alive to false
  questStore.currentGameLocation.monsters[monsterIndex].alive = false;
  
  // Check if this was the last monster to defeat for quest completion
  if (areAllMonstersDefeated(questStore.currentGameLocation.monsters)) {
    // Award XP for completing all monsters in a location (using updateStats)
    questStore.updateStats(5, 0, 0, "clearing all monsters from this location");
  }
}

// Revive a monster
function reviveMonster(monster: Monster) {
  if (!questStore.currentGameLocation?.monsters) return;

  // Find the monster in the location
  const monsterIndex = questStore.currentGameLocation.monsters.findIndex(m => m.id === monster.id);
  if (monsterIndex === -1) return;
  
  // Set alive to true
  questStore.currentGameLocation.monsters[monsterIndex].alive = true;
}

// Check if a monster is currently dying (in countdown)
function isMonsterDying(monsterId: string): boolean {
  return !!monstersDying.value[monsterId];
}
</script>

<style scoped>
.location-screen {
  min-height: 100vh;
  padding: 1rem;
}

.location-header {
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-bottom-width: 1px;
  border-bottom-style: solid;
}

.location-header h2 {
  font-size: 2rem;
  margin: 0;
}

.location-description-section {
  margin-bottom: 2rem;
}

.location-description {
  padding: 1rem;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  line-height: 1.5;
  font-style: italic;
}

.leave-button-container {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}

.gift-item-section, 
.prize-item-section {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
}

.gift-item-section h3,
.prize-item-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.combat-container {
  padding: 1rem;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
}

.monsters-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.monster-card {
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  --transition-duration: v-bind('`${transitionDurationSeconds}s`');
}

.monster-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  flex: 1;
}

.monster-name-container {
  flex: 3;
  min-width: 150px;
}

.monster-name {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.monster-subinfo {
  font-size: 0.9rem;
}

.monster-controls {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.monster-has-item {
  font-size: 1.5rem;
  cursor: pointer;
}

.monster-toggle-btn {
  padding: 0.75rem 0.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 85px;
}

.toggle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.toggle-icon {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.toggle-text {
  font-weight: bold;
}

.xp-text {
  font-size: 0.8rem;
  opacity: 0.8;
  text-align: center;
}

.monster-drink-bar {
  background: rgb(0,0,0,0.4);
  padding: 0.75rem;
  text-align: center;
  margin-top: auto;
}

.monster-item-locked {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.lock-icon {
  font-size: 4rem;
  color: white;
}

.prize-item-wrapper {
  position: relative;
}

.prize-item-wrapper + .prize-item-wrapper {
  margin-top: 1.5rem;
}

/* States */
.dying {
  position: relative;
  opacity: 0;
  filter: grayscale(1);
  transition: opacity var(--transition-duration, 1s) ease-in, 
              filter var(--transition-duration, 1s) ease-in;
}

.dying::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%; /* Ensure it covers the full width */
  background: rgba(255, 0, 0, 0.2);
  z-index: 1;
  pointer-events: none;
}

.defeated {
  opacity: 0.8;
}

.item-only {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}
</style> 