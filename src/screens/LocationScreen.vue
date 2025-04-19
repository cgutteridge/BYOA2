<template>
  <div class="location-screen">
    <div class="location-header">
      <h2>{{ questStore.currentGameLocation?.name }}</h2>
    </div>

    <!-- GameLocation description section -->
    <div class="location-description-section" v-if="questStore.currentGameLocation?.description">
      <div class="location-description">
        {{ questStore.currentGameLocation.description }}
      </div>
    </div>

    <div class="leave-button-container">
      <ButtonInput 
        class="leave-button"
        :action="leaveLocation"
        variant="primary"
        size="medium"
        :theme="questStore.theme"
      >
        Leave Location
      </ButtonInput>
    </div>

    <div class="gift-item-section" v-if="questStore.currentGameLocation?.giftItem">
      <h3><span class="icon">🎁</span> Gift Item Available!</h3>
      <ItemCard 
        :item="questStore.currentGameLocation.giftItem"
        variant="gift"
        :show-details="true"
        @action="claimGiftItem"
      />
    </div>

    <div class="combat-container" v-if="questStore.currentGameLocation?.monsters">
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
            :style="monster.alive ? getMonsterStyle(monster.type) : {}"
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
                        <template v-if="index === 0">(</template><span class="flag-item">{{ flag }}</span><template v-if="index < getMonsterFlags(monster.type).length - 1">, </template><template v-if="index === getMonsterFlags(monster.type).length - 1">)</template>
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
                    @click="toggleMonsterStatus(monster)"
                  >
                    <span class="toggle-icon">{{ isMonsterDying(monster.id) ? '❌' : (monster.alive ? '☠️' : '🔄') }}</span>
                    {{ isMonsterDying(monster.id) ? 'Cancel' : (monster.alive ? 'Defeat' : 'Revive') }}
                    <span class="xp-text">{{ getMonsterXP(monster.type) }}&nbsp;XP
                      <template v-if="getMonsterBooze(monster.type)>0">/ {{ formatNumber(getMonsterBooze(monster.type)) }}&nbsp;Booze</template>
                    </span>
                  </button>
                </div>
              </div>
              
              <!-- Monster drink bottom bar -->
              <div class="monster-drink-bar">
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
      <div v-if="questStore.currentGameLocation.prizeItem" class="prize-item-section">
        <h3><span class="icon">🏆</span> Quest Prize:</h3>
        <div class="prize-item-wrapper">
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
        <div class="prize-item-wrapper">
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
import {Monster} from "../types";
import '../styles/monsterAnimations.css';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useInventoryStore} from "../stores/inventoryStore";
import {useLocationStore} from "../stores/locationStore";
import ItemCard from "../components/ItemCard.vue";
import ButtonInput from "@/components/forms/ButtonInput.vue";
import {areAllMonstersDefeated, getMonsterBooze, getMonsterSoft, getMonsterXP} from "../quest/monsterUtils.ts";
import formatNumber from "../utils/formatNumber.ts";
import {generateTokenItem, generateTokenPowerItem} from "@/quest/itemUtils.ts";

// Constants
const MONSTER_DEFEAT_DELAY_MS = 1000; // 2 seconds

const questStore = useQuestStore()
const appStore = useAppStore()
const inventoryStore = useInventoryStore()
const locationStore = useLocationStore()

// Keep track of which monsters are currently being defeated (in the countdown)
const monstersDying = ref<Record<string, { timeoutId: number; startTime: number }>>({});

// Progress animation
let animationFrameId: number | null = null;

// Calculate transition duration in seconds for CSS
const transitionDurationSeconds = MONSTER_DEFEAT_DELAY_MS / 1000;

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

// Dynamically generate the token power item when needed
const tokenPowerItem = computed(() => {
  if (questStore.currentGameLocation) {
    return generateTokenPowerItem(questStore.currentGameLocation);
  }
  return null;
})

// Dynamically generate the regular token item when needed
const tokenItem = computed(() => {
  if (questStore.currentGameLocation) {
    return generateTokenItem(questStore.currentGameLocation);
  }
  return null;
})

function getMonsterTitle(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.title || monsterId
}

function getMonsterDrink(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.drink || "Unknown"
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

function getMonsterFlags(monsterId: string): string[] {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.flags || monster.flags.length === 0) return []
  
  return monster.flags
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
    questStore.updateStats(xpToAward, 0, 0, `claiming ${monster.item.name}`);
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
      questStore.updateStats(xpToAward, 0, 0, `claiming prize ${prizeItem.name}`);
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

function claimTokenPowerItem() {
  if (allMonstersDefeated.value && tokenPowerItem.value && questStore.currentGameLocation) {
    // Add the token power item to the inventory
    inventoryStore.addItem(tokenPowerItem.value);

    // Mark the location as having had its token claimed
    locationStore.setGameLocationHasToken(questStore.currentGameLocation.id, true);

    // Show notification
    appStore.addNotification(`You claimed the power token from ${questStore.currentGameLocation.name}!`);

    // Award XP for claiming the token power
    if (tokenPowerItem.value.level) {
      const xpToAward = tokenPowerItem.value.level * 2; // 2 XP per level for token power items
      questStore.updateStats(xpToAward, 0, 0, `claiming token power ${tokenPowerItem.value.name}`);
    }
  }
}

function claimTokenItem() {
  if (allMonstersDefeated.value && tokenItem.value && questStore.currentGameLocation) {
    // Add the token item to the inventory
    inventoryStore.addItem(tokenItem.value);

    // Mark the location as having had its token claimed
    locationStore.setGameLocationHasToken(questStore.currentGameLocation.id, true);

    // Show notification
    appStore.addNotification(`You claimed the token from ${questStore.currentGameLocation.name}!`);

    // Award XP for claiming the token
    if (tokenItem.value.level) {
      const xpToAward = tokenItem.value.level; // 1 XP per level for regular tokens
      questStore.updateStats(xpToAward, 0, 0, `claiming token ${tokenItem.value.name}`);
    }
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
      questStore.updateStats(xpToAward, 0, 0, `claiming gift ${giftItem.name}`);
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

function getMonsterStyle(monsterId: string): Record<string, string> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.style) return {}
  
  const style: Record<string, string> = {}
  
  if (monster.style.background) style.background = monster.style.background
  if (monster.style.color) style.color = monster.style.color
  if (monster.style.borderColor) style.borderColor = monster.style.borderColor
  if (monster.style.boxShadow) style.boxShadow = monster.style.boxShadow
  
  return style
}
</script>

<style scoped>
.location-screen {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #666666 100%);
  color: white;
  overflow-y: auto;
  text-align: center;
}

.location-header {
  justify-content: space-between;
  text-align: center;
  margin-bottom: 1.5rem;
}

.location-header h2 {
  display: inline-block;
  margin: 0;
  font-size: 2rem;
}

.leave-button-container {
  margin: 0 0 2rem 0;
  display: flex;
  justify-content: center;
}

.leave-button {
  min-width: 160px;
}

.location-description-section {
  max-width: 800px;
  margin: 1rem auto 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.location-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #f0f0f0;
  text-align: left;
  font-style: italic;
}

.gift-item-section, .prize-item-section, .token-power-item-section, .token-item-section {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.gift-item-section h3, .prize-item-section h3, .token-power-item-section h3, .token-item-section h3 {
  color: #ffeb3b;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-item-section .icon, .prize-item-section .icon, .token-power-item-section .icon, .token-item-section .icon {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.4rem;
}

.monster-item {
  margin-top: 1rem;
  opacity: 0.6;
  transition: all 0.3s ease;
  position: relative;
}

.monster-item.item-available {
  opacity: 1;
}

.monster-item-locked {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border-radius: 8px;
}

.lock-icon {
  font-size: 2rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.combat-container {
  max-width: 800px;
  margin: 0 auto;
}

.combat-container h3 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  color: #ffeb3b;
  text-align: center;
}

.monsters-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  column-gap: 0.75rem;
  row-gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.monster-card {
  border-radius: 8px;
  padding: 0;
  margin: 0;
  transition: all 0.3s ease;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Colored backgrounds based on monster species - removed, now in JSON */

.monster-card.defeated {
  opacity: 0.5;
  filter: grayscale(0.9);
  background: linear-gradient(135deg, #111111 0%, #333333 100%) !important;
  transition: opacity 0.3s ease-out, filter 0.3s ease-out, background 0.3s ease-out;
}

.monster-card.dying {
  opacity: 0;
  filter: grayscale(1);
  transition: opacity v-bind('`${transitionDurationSeconds}s`') ease-in, 
              filter v-bind('`${transitionDurationSeconds}s`') ease-in;
}

.monster-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0.75rem 0.4rem;
}

.monster-controls {
  display: flex;
  align-items: center;
}

.monster-toggle-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.toggle-icon {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.xp-text {
  font-size: 0.75rem;
  margin-top: 0.2rem;
  opacity: 0.9;
}

.kill-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(244, 67, 54, 0.7);
}

.kill-btn:hover {
  background-color: rgba(180, 30, 30, 0.6);
}

.cancel-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(76, 175, 80, 0.7);
}

.cancel-btn:hover {
  background-color: rgba(30, 180, 30, 0.6);
}

.unkill-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(76, 175, 80, 0.7);
}

.monster-name-container {
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 110px);
}

.monster-name {
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 0.2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  color: white;
}

.monster-subinfo {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.monster-flags {
  display: inline-block;
  margin-left: 0.25rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.flag-item {
  white-space: nowrap;
  display: inline-block;
  word-break: keep-all;
}

.monster-drink-bar {
  background: rgba(0, 0, 0, 0.4);
  text-align: center;
  padding: 0.6rem;
  margin-top: auto;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.prize-item-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.gift-item-section .item-card, 
.prize-item-section .item-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gift-item-section .item-card:hover, 
.prize-item-section .item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.monster-toggle-btn:hover {
  transform: scale(1.05);
  background-color: rgba(0, 0, 0, 0.6);
}

.monster-has-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  animation: subtle-pulse 2s infinite alternate;
  border-radius: 50%;
  padding: 5px;
  transition: all 0.2s ease;
}

.monster-has-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.15);
}

@keyframes subtle-pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.monster-card.item-only {
  background: transparent !important;
  opacity: 1;
  filter: none;
  transition: all 0.3s ease;
  padding: 0.75rem;
  box-shadow: none;
}

.token-item-section {
  background-color: rgba(255, 204, 0, 0.05);
}

.token-item-wrapper {
  position: relative;
}
</style> 