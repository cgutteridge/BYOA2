<template>
  <div class="location-screen">
    <div class="location-header">
      <h2>{{ questStore.currentPub?.name }}</h2>
      <button class="leave-button" @click="leavePub">Leave Pub</button>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore";
import {useQuestStore} from "../stores/questStore";
import {monsterTypes} from "../data/monsterTypes";
import {Unit} from "../types";
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