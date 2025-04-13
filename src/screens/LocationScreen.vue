<template>
  <div class="location-screen">
    <div class="location-header">
      <h2>{{ questStore.currentPub?.name }}</h2>
      <button class="leave-button" @click="leavePub">Leave Pub</button>
    </div>

    <div class="gift-item-section" v-if="questStore.currentPub?.giftItem">
      <div class="gift-item-container">
        <h3>Gift Item Available!</h3>
        <div class="item-card">
          <div class="item-name">{{ questStore.currentPub.giftItem.name }}</div>
          <div class="item-description">{{ questStore.currentPub.giftItem.description }}</div>
          <div class="item-details">
            <span class="item-type">Type: {{ getItemTypeName(questStore.currentPub.giftItem.type, questStore.currentPub.giftItem.level) }}</span>
            <span class="item-level">Level: {{ questStore.currentPub.giftItem.level }}</span>
            <span class="item-uses">Uses: {{ questStore.currentPub.giftItem.uses }}</span>
            <span class="item-target" v-if="questStore.currentPub.giftItem.target">
              Target: {{ questStore.currentPub.giftItem.target }}
            </span>
          </div>
          <button class="take-item-btn">Take Gift</button>
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
          <div class="unit-title">{{ getMonsterTitle(unit.type) }}</div>
          <div class="unit-subinfo">{{ getMonsterSpecies(unit.type) }} {{ getMonsterLevel(unit.type) }}{{ getMonsterTraits(unit.type) }}</div>
          <div class="unit-drink"><strong>Drink:</strong> {{ getMonsterDrink(unit.type) }}</div>
          <div class="unit-xp"><strong>XP:</strong> {{ getMonsterXP(unit.type) }}</div>
        </div>
        
        <div class="enemies-container">
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
          <div class="item-card">
            <div class="item-name">{{ unit.item.name }}</div>
            <div class="item-description">{{ unit.item.description }}</div>
            <div class="item-details">
              <span class="item-type">Type: {{ getItemTypeName(unit.item.type, unit.item.level) }}</span>
              <span class="item-level">Level: {{ unit.item.level }}</span>
              <span class="item-uses">Uses: {{ unit.item.uses }}</span>
              <span class="item-target" v-if="unit.item.target">
                Target: {{ unit.item.target }}
              </span>
            </div>
            <button class="take-item-btn" :disabled="!isUnitDefeated(unit)">
              {{ isUnitDefeated(unit) ? 'Claim Item' : 'Defeat unit to claim' }}
            </button>
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
import {itemTypesById, getItemTypesByLevel} from "../data/itemTypes";
import {Unit, ItemTypeId} from "../types";
import {isUnitDefeated, toggleEnemyStatus} from "../helpers/combatHelper";
import '../styles/monsterStyles.css';

const questStore = useQuestStore()
const appStore = useAppStore()

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
  
  return ` (${monster.flags.join(', ')})`
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

.item-description {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
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
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.unit-subinfo {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
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
</style> 