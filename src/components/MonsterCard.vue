<template>
  <div
    class="monster-card"
    :class="[
      monster.alive ? getMonsterClasses(monster.type) : 'item-only', 
      { 
        'defeated': !monster.alive,
        'dying': isMonsterDying
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
            @click="viewItemDetails"
          >🎁</span>
          <button
            class="monster-toggle-btn"
            :class="{
              'kill-btn': monster.alive && !isMonsterDying, 
              'cancel-btn': isMonsterDying,
              'unkill-btn': !monster.alive 
            }"
            :style="getToggleButtonStyle()"
            @click="toggleMonsterStatus"
          >
            <div class="toggle-content">
              <div class="toggle-icon">{{ isMonsterDying ? '❌' : (monster.alive ? '☠️' : '🔄') }}</div>
              <div class="toggle-text">
                {{ isMonsterDying ? 'Cancel' : (monster.alive ? 'Defeat' : 'Revive') }}
              </div>
              <div class="xp-text">{{ getMonsterXP(monster.type) }}&nbsp;XP
                <template v-if="getMonsterBooze(monster.type)>0">/ {{ formatNumber(getMonsterBooze(monster.type)) }}&nbsp;Booze</template>
              </div>
            </div>
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
        @action="claimItem"
        @contextmenu.prevent="toggleMonsterStatus"
        title="Right-click to revive monster"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import type { Monster } from '@/types';
import { monsterTypes } from '@/data/monsterTypes';
import { useQuestStore } from '@/stores/questStore';
import { useAppStore } from '@/stores/appStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useLocationStore } from '@/stores/locationStore';
import { getMonsterXP, getMonsterBooze, getMonsterSoft, areAllMonstersDefeated } from '@/quest/monsterUtils';
import formatNumber from '@/utils/formatNumber';
import ItemCard from '@/components/ItemCard.vue';
import pickOne from "@/utils/pickOne.ts";
import {generateRandomItem} from "@/quest/generateRandomItem.ts";

// Constants
const MONSTER_DEFEAT_DELAY_MS = 1000;
const transitionDurationSeconds = MONSTER_DEFEAT_DELAY_MS/1000;

// Props
interface Props {
  monster: Monster;
}

const props = defineProps<Props>();

// Stores
const questStore = useQuestStore();
const appStore = useAppStore();
const inventoryStore = useInventoryStore();
const locationStore = useLocationStore();

// Track monster dying state
const timeoutRef = ref<number | null>(null);
const dyingStartTime = ref<number | null>(null);
const isMonsterDying = computed(() => dyingStartTime.value !== null);

// Theme-based styles
const monsterDefeatStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('tertiary'),
  borderColor: questStore.getBorderColor('medium'),
}));

// Clean up any timeouts when component is unmounted
onUnmounted(() => {
  if (timeoutRef.value !== null) {
    window.clearTimeout(timeoutRef.value);
    timeoutRef.value = null;
  }
});

// Functions
function getMonsterTitle(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId);
  return monster?.title || monsterId;
}

function getMonsterDrink(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId);
  return monster?.drink || "Unknown";
}

function getMonsterSpecies(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId);
  if (!monster) return "Unknown";

  // Capitalize first letter of species
  return monster.species.charAt(0).toUpperCase() + monster.species.slice(1);
}

function getMonsterLevel(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId);
  if (!monster) return "Unknown";

  // Capitalize first letter of level
  return monster.level.charAt(0).toUpperCase() + monster.level.slice(1);
}

function getMonsterFlags(monsterId: string): string[] {
  const monster = monsterTypes.find(m => m.id === monsterId);
  if (!monster || !monster.flags) return [];

  return monster.flags;
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monster = monsterTypes.find(m => m.id === monsterId);
  if (!monster) return {};

  const classes: Record<string, boolean> = {};

  // Add additional classes from monster style
  if (monster.style?.additionalClasses) {
    monster.style.additionalClasses.forEach(className => {
      classes[className] = true;
    });
  }

  return classes;
}

function getMonsterStyle(monsterId: string): Record<string, string> {
  const monster = monsterTypes.find(m => m.id === monsterId);
  if (!monster || !monster.style) return {};

  const style: Record<string, string> = {
    backgroundColor: questStore.getBackgroundColor('card'),
    borderColor: questStore.getBorderColor('medium'),
    color: questStore.getTextColor('primary')
  };

  // If monster has style.background, use it
  if (monster.style.background) {
    style.background = monster.style.background;
  }

  // If monster has style.borderColor, use it
  if (monster.style.borderColor) {
    style.borderColor = monster.style.borderColor;
  }

  // If monster has style.color, use it
  if (monster.style.color) {
    style.color = monster.style.color;
  }

  // If monster has style.boxShadow, use it
  if (monster.style.boxShadow) {
    style.boxShadow = monster.style.boxShadow;
  }

  return style;
}

function getToggleButtonStyle(): Record<string, string> {
  if (!props.monster.alive) {
    // Revive button style
    return {
      backgroundColor: questStore.getButtonColors('secondary').background,
      color: questStore.getButtonColors('secondary').text,
      borderColor: questStore.getButtonColors('secondary').border
    };
  } else if (isMonsterDying.value) {
    // Cancel button style
    return {
      backgroundColor: questStore.getButtonColors('secondary').background,
      color: questStore.getButtonColors('secondary').text,
      borderColor: questStore.getButtonColors('secondary').border
    };
  } else {
    // Defeat button style
    return {
      backgroundColor: questStore.getButtonColors('danger').background,
      color: questStore.getButtonColors('danger').text,
      borderColor: questStore.getButtonColors('danger').border
    };
  }
}

function viewItemDetails(): void {
  if (props.monster.item) {
    appStore.openItemInspectModal(props.monster.item);
  }
}

// Function to handle monster status toggling with delay
function toggleMonsterStatus(): void {
  if (props.monster.alive) {
    // If already dying, cancel the countdown
    if (isMonsterDying.value) {
      cancelDefeatCountdown();
      return;
    }

    // Start defeat countdown
    startDefeatCountdown();
  } else {
    // Revive immediately
    reviveMonster();
  }
}

// Start defeat countdown for the monster
function startDefeatCountdown(): void {
  dyingStartTime.value = Date.now();

  // Set timeout for defeat
  timeoutRef.value = window.setTimeout(() => {
    // Actually defeat the monster
    defeatMonster();
    // Reset dying state
    dyingStartTime.value = null;
    timeoutRef.value = null;
  }, MONSTER_DEFEAT_DELAY_MS);
}

// Cancel the monster's defeat countdown
function cancelDefeatCountdown(): void {
  if (timeoutRef.value !== null) {
    window.clearTimeout(timeoutRef.value);
    timeoutRef.value = null;
    dyingStartTime.value = null;
  }
}

// Actually defeat the monster
function defeatMonster(): void {
  if (!questStore.currentGameLocation?.monsters) return;

  // Update stats
  const xpToAdd = getMonsterXP(props.monster.type);
  const unitsToAdd = getMonsterBooze(props.monster.type);
  const softToAdd = getMonsterSoft(props.monster.type);
  questStore.logAndNotifyQuestEvent(`Defeated ${props.monster.name} in combat.`, { xp: xpToAdd, booze: unitsToAdd, soft: softToAdd });

  // Maybe add a minor loot drop?
  if (!props.monster.item && pickOne([true, false])) {
    const monsterType = monsterTypes.find(m => m.id === props.monster.type);
    const item = generateRandomItem(pickOne([1,2]))
    item.maxLevel = monsterType?.level || "minion"
    props.monster.item = item
  }

  // Set alive to false
  props.monster.alive = false;

  // Increment the defeatedEnemies count in the current location
  locationStore.incrementDefeatedEnemiesCount(questStore.currentGameLocation.id);

  // Check if this was the last monster to defeat for quest completion
  if (areAllMonstersDefeated(questStore.currentGameLocation.monsters)) {
    // Award XP for completing all monsters in a location
    questStore.logAndNotifyQuestEvent(`Defeated all monsters at ${questStore.currentGameLocation.name} in combat.`, { xp: 5 });
  }
}

// Revive a monster
function reviveMonster(): void {
  if (!questStore.currentGameLocation?.monsters) return;

  // Find the monster in the location
  const monsterIndex = questStore.currentGameLocation.monsters.findIndex(m => m.id === props.monster.id);
  if (monsterIndex === -1) return;

  // Set alive to true
  questStore.currentGameLocation.monsters[monsterIndex].alive = true;
}

// Claim an item from a defeated monster
function claimItem(): void {
  // Only process if monster has an item and is dead
  if (!props.monster.item || props.monster.alive) {
    return;
  }

  // Add item to inventory
  inventoryStore.addItem(props.monster.item);

  // Award XP based on item level
  if (props.monster.item.level) {
    const xpToAward = props.monster.item.level * 2; // 2 XP per item level
    questStore.logAndNotifyQuestEvent(`Claimed ${props.monster.item.name}.`, { xp: xpToAward });
  }

  // Clear the item from the monster
  if (questStore.currentGameLocation?.monsters) {
    const monsterIndex = questStore.currentGameLocation.monsters.findIndex(m => m.id === props.monster.id);
    if (monsterIndex !== -1) {
      // Clear the item
      questStore.currentGameLocation.monsters[monsterIndex].item = undefined;
    }
  }
}
</script>

<style scoped>
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