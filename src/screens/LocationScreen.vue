<template>
  <div class="location-screen">
    <div class="location-header">
      <h2>{{ questStore.currentPub?.name }}</h2>
    </div>

    <button class="leave-button" @click="leavePub">Leave</button>

    <!-- Location description section -->
    <div class="location-description-section" v-if="questStore.currentPub?.description">
      <div class="location-description">
        {{ questStore.currentPub.description }}
      </div>
    </div>

    <div class="gift-item-section" v-if="questStore.currentPub?.giftItem">
      <div class="gift-item-container">
        <h3>Gift Item Available!</h3>
        <ItemCard 
          :item="questStore.currentPub.giftItem"
          variant="gift"
          :show-details="true"
          @action="claimGiftItem"
        />
      </div>
    </div>

    <div class="combat-container" v-if="questStore.currentPub?.monsters">
      <!-- All monsters in a 3-column flex layout with active ones first -->
      <div class="monsters-container">
        <div 
          v-for="monster in sortedMonsters" 
          :key="monster.id"
          class="monster-card"
          :class="[getMonsterClasses(monster.type), { 'defeated': !monster.alive }]"
        >
          <!-- Monster header with name and attributes on one line -->
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
              <button 
                class="monster-toggle-btn" 
                :class="{ 'kill-btn': monster.alive, 'unkill-btn': !monster.alive }"
                @click="toggleMonsterStatus(monster)"
              >
                <span class="toggle-icon">{{ monster.alive ? '☠️' : '🔄' }}</span>
                {{ monster.alive ? 'Defeat' : 'Revive' }}
                <span class="xp-text">{{ getMonsterXP(monster.type) }} XP</span>
              </button>
            </div>
          </div>
          
          <!-- Monster drink bottom bar -->
          <div class="monster-drink-bar">
            {{ getMonsterDrink(monster.type) }}
          </div>
          
          <!-- Monster item (if any) - use ItemCard component -->
          <div v-if="monster.item" class="monster-item" :class="{'item-available': !monster.alive}">
            <div v-if="monster.alive" class="monster-item-locked">
              <span class="lock-icon">🔒</span>
            </div>
            <ItemCard 
              :item="monster.item"
              variant="drop"
              :show-details="true"
              @action="claimItem(monster)"
            />
          </div>
        </div>
      </div>
      
      <!-- Prize item section -->
      <div v-if="questStore.currentPub.prizeItem" class="prize-item-section">
        <div class="prize-item-container">
          <h3>Quest Prize:</h3>
          <div class="prize-item-wrapper">
            <div v-if="!allMonstersDefeated" class="monster-item-locked">
              <span class="lock-icon">🔒</span>
            </div>
            <ItemCard 
              :item="questStore.currentPub.prizeItem"
              variant="prize"
              :show-details="true"
              @action="claimPrizeItem"
            />
          </div>
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
import {areAllMonstersDefeated, claimMonsterItem, toggleMonsterStatus} from "../quest/combat.ts";
import '../styles/monsterStyles.css';
import {computed} from 'vue';
import {useInventoryStore} from "../stores/inventoryStore";
import ItemCard from "../components/ItemCard.vue";

const questStore = useQuestStore()
const appStore = useAppStore()
const inventoryStore = useInventoryStore()

// Keep monsters in their original order rather than sorting based on alive status
const sortedMonsters = computed(() => {
  if (!questStore.currentPub?.monsters || !questStore.currentPub.monsters.length) {
    return [];
  }
  
  // Simply return the monsters array without reordering
  return [...questStore.currentPub.monsters];
});

// Compute whether all monsters are defeated here
const allMonstersDefeated = computed(() => {
  return questStore.currentPub?.monsters 
    ? areAllMonstersDefeated(questStore.currentPub.monsters) 
    : false
})

function getMonsterTitle(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.title || monsterId
}

function getMonsterDrink(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.drink || "Unknown"
}

function getMonsterXP(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (monster?.xp !== undefined) {
    // If XP is a whole number, show as integer, otherwise show one decimal place
    return monster.xp % 1 === 0 ? monster.xp.toString() : monster.xp.toFixed(1);
  }
  return "Unknown";
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return {}
  
  const classes = {
    [`monster-${monster.species}`]: true,
    [`monster-${monster.level}`]: true
  }
  
  // Add special classes for themed monsters
  if (monster.id.includes('desert') || monster.id.includes('sand')) {
    classes['desert-monster'] = true
  } else if (monster.id.includes('flame') || monster.id.includes('fire')) {
    classes['flame-monster'] = true
  } else if (monster.id.includes('earth') || monster.id.includes('mountain')) {
    classes['earth-monster'] = true
  } else if (monster.id.includes('water') || monster.id.includes('tidal')) {
    classes['water-monster'] = true
  } else if (monster.id.includes('ice') || monster.id.includes('frost') || monster.id.includes('glacial')) {
    classes['ice-monster'] = true
  } else if (monster.id.includes('obsidian')) {
    classes['obsidian-monster'] = true
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

function leavePub() {
  appStore.setScreen('map')
  questStore.unsetCurrentPub()
}

function claimItem(monster: Monster) {
  // Only allow claiming items from defeated monsters
  if (!monster.alive && monster.item) {
    const itemName = monster.item.name;
    const success = claimMonsterItem(monster);
    
    if (success) {
      appStore.addNotification(`${itemName} added to inventory!`, 'success');
    }
  } else {
    // If monster is alive, just show the item description
    if (monster.item) {
      appStore.openItemInspectModal(monster.item);
    }
  }
}

function claimPrizeItem() {
  if (allMonstersDefeated.value && questStore.currentPub?.prizeItem) {
    inventoryStore.addItem(questStore.currentPub.prizeItem);
    delete questStore.currentPub.prizeItem;
    appStore.addNotification('Prize item added to your inventory!', 'success');
  } else {
    // Just show the description if not all monsters are defeated
    if (questStore.currentPub?.prizeItem) {
      appStore.openItemInspectModal(questStore.currentPub.prizeItem);
    }
  }
}

function claimGiftItem() {
  if (questStore.currentPub?.giftItem) {
    const giftItem = questStore.currentPub.giftItem;
    
    // Add to inventory
    inventoryStore.addItem(giftItem);
    
    // Remove from pub
    delete questStore.currentPub.giftItem;
    
    // Show notification
    appStore.addNotification(`Gift ${giftItem.name} added to inventory!`, 'success');
  }
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

.leave-button {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  margin: auto;
  display: inline-block;
  cursor: pointer;
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

.gift-item-section, .prize-item-section {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.gift-item-container, .prize-item-container {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.gift-item-container h3, .prize-item-container h3 {
  color: #ffeb3b;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
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

/* Colored backgrounds based on monster species */
.monster-vampire {
  background: linear-gradient(135deg, #480708 0%, #710b0d 100%);
}

.monster-ghost {
  background: linear-gradient(135deg, #2d3a4a 0%, #3f51b5 100%);
}

.monster-human {
  background: linear-gradient(135deg, #4a3932 0%, #795548 100%);
}

.monster-chameleonoid {
  background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%);
}

.monster-goblinoid {
  background: linear-gradient(135deg, #1b4d1b 0%, #388e3c 100%);
}

.monster-elf {
  background: linear-gradient(135deg, #0d47a1 0%, #2196f3 100%);
}

.monster-demonoid {
  background: linear-gradient(135deg, #bf360c 0%, #ff5722 100%);
}

.monster-dwarf {
  background: linear-gradient(135deg, #52433a 0%, #8d6e63 100%);
}

.monster-special {
  background: linear-gradient(135deg, #311b92 0%, #673ab7 100%);
}

.monster-fey {
  background: linear-gradient(135deg, #00695c 0%, #009688 100%);
}

.monster-elemental {
  background: linear-gradient(135deg, #045c8c 0%, #03a9f4 100%);
}

/* Darker backgrounds for boss and elite monsters */
.monster-boss {
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.monster-elite {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.monster-card.defeated {
  opacity: 0.5;
  filter: grayscale(0.9);
  background: linear-gradient(135deg, #111111 0%, #333333 100%) !important;
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
}
</style> 