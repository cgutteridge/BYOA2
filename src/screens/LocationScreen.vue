<template>
  <div class="location-screen">
    <div class="location-header">
      <h2>{{ questStore.currentPub?.name }}</h2>
      <button class="leave-button" @click="leavePub">Leave Pub</button>
    </div>

    <!-- Added location description section -->
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
      <div 
        v-for="(unit, unitIndex) in questStore.currentPub.monsters" 
        :key="unitIndex" 
        class="monster-unit"
        :class="{ 'defeated': isUnitDefeated(unit) }"
      >
        <div class="unit-header">
          <div class="unit-title">{{ unit.name }}</div>
          <div class="unit-subinfo">{{ getMonsterTitle(unit.type) }}, {{ getMonsterSpecies(unit.type) }} {{ getMonsterLevel(unit.type) }}{{ getMonsterTraits(unit.type) }}</div>
          <div class="unit-drink"><strong>Drink:</strong> {{ getMonsterDrink(unit.type) }}</div>
          <div class="unit-xp"><strong>XP:</strong> {{ getMonsterXP(unit.type) }}</div>
        </div>
        
        <div class="enemies-container location-enemies">
          <div 
            v-for="(enemy, enemyIndex) in unit.members" 
            :key="enemyIndex"
            class="enemy-card"
            :class="[getMonsterClasses(unit.type), { 'defeated': !enemy.alive }]"
            @click="handleToggleEnemy(unitIndex, enemyIndex)"
          >
            <div class="enemy-info">
              <div class="enemy-name">{{ enemy.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="unit.item" class="unit-item-section">
          <h4>Monster Item</h4>
          <div class="item-card" :class="{'item-card-level4': unit.item.level === 4, 'item-card-level5': unit.item.level === 5}">
            <div class="item-name" :class="{'item-name-level4': unit.item.level === 4, 'item-name-level5': unit.item.level === 5}">
              {{ unit.item.name }}
            </div>
            <div class="item-power">{{ unit.item.power }}</div>
            <div v-if="unit.item.description" class="item-description">
              <span class="description-label">Story:</span> {{ unit.item.description }}
            </div>
            <div class="item-details">
              <span class="item-type">Type: {{ getItemTypeName(unit.item.type, unit.item.level) }}</span>
              <span class="item-level" :class="{'item-level-4': unit.item.level === 4, 'item-level-5': unit.item.level === 5}">
                Level: {{ unit.item.level }}
              </span>
              <span class="item-uses">Uses: {{ unit.item.uses }}</span>
              <span class="item-target" v-if="unit.item.target">
                Target: {{ unit.item.target }}
              </span>
            </div>
            <button class="take-item-btn" :class="{'take-item-btn-level4': unit.item.level === 4, 'take-item-btn-level5': unit.item.level === 5}" :disabled="!isUnitDefeated(unit)">
              {{ isUnitDefeated(unit) ? 'Claim Item' : 'Defeat unit to claim' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modified prize item section - removed areAllUnitsDefeated condition -->
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
            <button class="take-item-btn" :class="{'take-item-btn-level4': questStore.currentPub.prizeItem.level === 4, 'take-item-btn-level5': questStore.currentPub.prizeItem.level === 5}" :disabled="!areAllUnitsDefeated">
              {{ areAllUnitsDefeated ? 'Claim Prize' : 'Defeat all enemies to claim' }}
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
import {Unit, ItemTypeId} from "../types";
import {isUnitDefeated, toggleEnemyStatus} from "../helpers/combatHelper";
import '../styles/monsterStyles.css';
import { computed } from 'vue';

const questStore = useQuestStore()
const appStore = useAppStore()

// Check if all units are defeated
const areAllUnitsDefeated = computed(() => {
  if (!questStore.currentPub?.monsters || questStore.currentPub.monsters.length === 0) {
    return false;
  }
  
  return questStore.currentPub.monsters.every(unit => isUnitDefeated(unit));
});

function handleToggleEnemy(unitIndex: number, enemyIndex: number): void {
  if (!questStore.currentPub?.monsters) return
  
  const unit = questStore.currentPub.monsters[unitIndex]
  toggleEnemyStatus(unit, enemyIndex)
}

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
  margin-bottom: 2rem;
}

.leave-button {
  padding: 0.8rem 1.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.gift-item-section {
  margin-bottom: 2rem;
  max-width: 800px;
  margin: 0 auto 2rem auto;
}

.gift-item-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.gift-item-container h3 {
  color: #ffeb3b;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.item-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.item-name {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff;
}

.item-power {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
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

.item-card-level4 {
  border: 1px solid #ba68c8;
  box-shadow: 0 0 15px rgba(186, 104, 200, 0.4);
}

.item-card-level5 {
  border: 1px solid #ff9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 152, 0, 0.8);
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

.monster-unit {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.monster-unit.defeated {
  opacity: 0.6;
  background: rgba(100, 100, 100, 0.1);
}

.unit-header {
  margin-bottom: 1.5rem;
  text-align: left;
}

.unit-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #ffeb3b;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.unit-subinfo {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  font-style: italic;
}

.unit-drink, .unit-xp {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.unit-item-section {
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1.5rem;
}

.unit-item-section h4 {
  color: #ffeb3b;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.enemies-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.enemy-card {
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.enemy-card.defeated {
  opacity: 0.5;
  filter: grayscale(1);
}

.enemy-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
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

.prize-item-section {
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.prize-item-container {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.prize-item-container h3 {
  color: #ffeb3b;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

/* Styles for the location description */
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

.location-enemies .enemy-card {
  /* Allow monster type colors to show through */
}

.location-enemies .enemy-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
</style> 