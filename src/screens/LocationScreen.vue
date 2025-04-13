<template>
  <div class="location-screen">
    <div class="location-header">
      <h2>{{ questStore.currentPub?.name }}</h2>
      <button class="leave-button" @click="leavePub">Leave Pub</button>
    </div>

    <!-- Location description section -->
    <div class="location-description-section" v-if="questStore.currentPub?.description">
      <div class="location-description">
        {{ questStore.currentPub.description }}
      </div>
    </div>

    <div class="gift-item-section" v-if="questStore.currentPub?.giftItem">
      <div class="gift-item-container">
        <h3>Gift Item Available!</h3>
        <div class="item-card" :class="{'item-card-level4': questStore.currentPub.giftItem.level === 4, 'item-card-level5': questStore.currentPub.giftItem.level === 5}">
          <div class="item-name" :class="{'item-name-level4': questStore.currentPub.giftItem.level === 4, 'item-name-level5': questStore.currentPub.giftItem.level === 5}">
            {{ questStore.currentPub.giftItem.name }}
          </div>
          <div class="item-power">{{ questStore.currentPub.giftItem.power }}</div>
          <div v-if="questStore.currentPub.giftItem.description" class="item-description">
            <span class="description-label">Story:</span> {{ questStore.currentPub.giftItem.description }}
          </div>
          <div class="item-details">
            <span class="item-type">Type: {{ getItemTypeName(questStore.currentPub.giftItem.type, questStore.currentPub.giftItem.level) }}</span>
            <span class="item-level" :class="{'item-level-4': questStore.currentPub.giftItem.level === 4, 'item-level-5': questStore.currentPub.giftItem.level === 5}">
              Level: {{ questStore.currentPub.giftItem.level }}
            </span>
            <span class="item-uses">Uses: {{ questStore.currentPub.giftItem.uses }}</span>
            <span class="item-target" v-if="questStore.currentPub.giftItem.target">
              Target: {{ questStore.currentPub.giftItem.target }}
            </span>
          </div>
          <button class="take-item-btn" :class="{'take-item-btn-level4': questStore.currentPub.giftItem.level === 4, 'take-item-btn-level5': questStore.currentPub.giftItem.level === 5}">
            Take Gift
          </button>
        </div>
      </div>
    </div>

    <div class="combat-container" v-if="questStore.currentPub?.monsters">
      <h3>Monsters:</h3>
      
      <!-- All monsters in a single list with active ones first -->
      <div class="monsters-container">
        <div 
          v-for="monster in sortedMonsters" 
          :key="monster.type + monster.name"
          class="monster-card"
          :class="[getMonsterClasses(monster.type), { 'defeated': !monster.alive }]"
          @click="toggleMonsterStatus(monster)"
        >
          <div class="monster-info">
            <div class="monster-name">{{ monster.name }}</div>
            <div class="monster-details">
              <div class="monster-type">{{ getMonsterTitle(monster.type) }}</div>
              <div class="monster-race">{{ getMonsterSpecies(monster.type) }} {{ getMonsterLevel(monster.type) }}{{ getMonsterTraits(monster.type) }}</div>
              <div class="monster-drink"><strong>Drink:</strong> {{ getMonsterDrink(monster.type) }}</div>
              <div class="monster-xp"><strong>XP:</strong> {{ getMonsterXP(monster.type) }}</div>
            </div>
            
            <!-- Monster item (if any) -->
            <div v-if="monster.item" class="monster-item">
              <div class="item-info">
                <div class="item-name" :class="{'item-name-level4': monster.item.level === 4, 'item-name-level5': monster.item.level === 5}">
                  {{ monster.item.name }}
                </div>
                <div class="item-power">{{ monster.item.power }}</div>
                <button class="take-item-btn" :class="{'take-item-btn-level4': monster.item.level === 4, 'take-item-btn-level5': monster.item.level === 5}" :disabled="monster.alive">
                  {{ !monster.alive ? 'Claim Item' : 'Defeat to claim' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Prize item section -->
      <div v-if="questStore.currentPub.prizeItem" class="prize-item-section">
        <div class="prize-item-container">
          <h3>Quest Prize:</h3>
          <div class="item-card" :class="{'item-card-level4': questStore.currentPub.prizeItem.level === 4, 'item-card-level5': questStore.currentPub.prizeItem.level === 5}">
            <div class="item-name" :class="{'item-name-level4': questStore.currentPub.prizeItem.level === 4, 'item-name-level5': questStore.currentPub.prizeItem.level === 5}">
              {{ questStore.currentPub.prizeItem.name }}
            </div>
            <div class="item-power">{{ questStore.currentPub.prizeItem.power }}</div>
            <div v-if="questStore.currentPub.prizeItem.description" class="item-description">
              <span class="description-label">Story:</span> {{ questStore.currentPub.prizeItem.description }}
            </div>
            <div class="item-details">
              <span class="item-type">Type: {{ getItemTypeName(questStore.currentPub.prizeItem.type, questStore.currentPub.prizeItem.level) }}</span>
              <span class="item-level" :class="{'item-level-4': questStore.currentPub.prizeItem.level === 4, 'item-level-5': questStore.currentPub.prizeItem.level === 5}">
                Level: {{ questStore.currentPub.prizeItem.level }}
              </span>
              <span class="item-uses">Uses: {{ questStore.currentPub.prizeItem.uses }}</span>
              <span class="item-target" v-if="questStore.currentPub.prizeItem.target">
                Target: {{ questStore.currentPub.prizeItem.target }}
              </span>
            </div>
            <button class="take-item-btn" :class="{'take-item-btn-level4': questStore.currentPub.prizeItem.level === 4, 'take-item-btn-level5': questStore.currentPub.prizeItem.level === 5}" :disabled="!areAllMonstersDefeated">
              {{ areAllMonstersDefeated ? 'Claim Prize' : 'Defeat all monsters to claim' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <pre>{{ questStore.currentPub }}</pre>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore";
import {useQuestStore} from "../stores/questStore";
import {monsterTypes} from "../data/monsterTypes";
import {itemTypesById, getItemTypesByLevel} from "../data/itemTypes";
import {Monster, ItemTypeId} from "../types";
import {areAllMonstersDefeated, toggleMonsterStatus} from "../helpers/combatHelper";
import '../styles/monsterStyles.css';
import { computed } from 'vue';

const questStore = useQuestStore()
const appStore = useAppStore()

// Sort monsters with active ones first, then defeated ones
const sortedMonsters = computed(() => {
  if (!questStore.currentPub?.monsters || !questStore.currentPub.monsters.length) {
    return [];
  }
  
  // Create a copy of the monsters array to avoid modifying the original
  return [...questStore.currentPub.monsters].sort((a, b) => {
    // Sort alive monsters first
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    
    // If both are alive or both are defeated, sort by type/name
    return a.name.localeCompare(b.name);
  });
});

// Check if all monsters are defeated
const areAllMonstersDefeated = computed(() => {
  if (!questStore.currentPub?.monsters || questStore.currentPub.monsters.length === 0) {
    return false;
  }
  
  return questStore.currentPub.monsters.every(monster => !monster.alive);
});

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
  return monster?.xp ? monster.xp.toFixed(1) : "Unknown"
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return {}
  
  return {
    [`monster-${monster.species}`]: true,
    [`monster-${monster.level}`]: true
  }
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

function getItemTypeName(itemTypeId: string, level: number = 1): string {
  const itemTypes = getItemTypesByLevel(level, itemTypeId as ItemTypeId);
  if (itemTypes.length > 0) {
    return itemTypes[0].title;
  }
  return itemTypesById[itemTypeId as ItemTypeId]?.title || itemTypeId;
}

function leavePub() {
  appStore.setScreen('map')
  questStore.unsetCurrentPub()
}
</script>

<style scoped>
.location-screen {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  overflow-y: auto;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.location-header h2 {
  margin: 0;
  font-size: 2rem;
}

.leave-button {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
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

.item-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.item-card-level4 {
  box-shadow: 0 0 10px rgba(186, 104, 200, 0.3);
  animation: glow-purple 2s infinite alternate;
}

.item-card-level5 {
  box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
  animation: glow-orange 2s infinite alternate;
}

@keyframes glow-purple {
  0% {
    box-shadow: 0 0 10px rgba(186, 104, 200, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(186, 104, 200, 0.5);
  }
}

@keyframes glow-orange {
  0% {
    box-shadow: 0 0 15px rgba(255, 152, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.5);
  }
}

.item-name-level4 {
  color: #ba68c8;
  text-shadow: 0 0 5px rgba(186, 104, 200, 0.3);
}

.item-name-level5 {
  color: #ffc107;
  text-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
  font-weight: 800;
  letter-spacing: 0.5px;
}

.take-item-btn-level4 {
  background: linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%) !important;
  color: white !important;
}

.take-item-btn-level5 {
  background: linear-gradient(135deg, #ff9800 0%, #ffeb3b 100%) !important;
  color: #333 !important;
  text-transform: uppercase;
  font-weight: 800;
}

.take-item-btn {
  padding: 0.8rem 1.5rem;
  background: #8bc34a;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
}

.take-item-btn:hover {
  background: #9ccc65;
  transform: translateY(-2px);
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.monster-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.monster-card.defeated {
  opacity: 0.7;
  filter: grayscale(0.7);
}

.monster-info {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.monster-name {
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.monster-details {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.monster-type, .monster-race, .monster-drink, .monster-xp {
  padding: 0.3rem 0.6rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: inline-block;
}

.monster-item {
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.item-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.item-power {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

button {
  padding: 0.8rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:disabled {
  background: #666;
  cursor: not-allowed;
}

.item-description {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  font-style: italic;
}

.description-label {
  font-weight: bold;
  color: #ffeb3b;
  font-style: normal;
}

.item-details {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.item-type, .item-uses, .item-target, .item-level {
  padding: 0.3rem 0.6rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.item-level {
  color: #ffeb3b;
  position: relative;
}

.item-level-4 {
  color: #ba68c8;
  font-weight: bold;
}

.item-level-5 {
  color: #ff9800;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 152, 0, 0.5);
}
</style> 