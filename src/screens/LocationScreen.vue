<template>
  <div class="location-screen">

    <div class="location-header">
      <h2>{{ questStore.currentPub?.name }}</h2>
      <div> CURRENT LOCATION</div>
      <button class="leave-button" @click="leavePub">Leave Pub</button>
    </div>

    <div class="monster-list" v-if="questStore.currentPub?.monsters">
      <div 
        v-for="(monster, index) in questStore.currentPub.monsters" 
        :key="index" 
        class="monster-card"
        :class="getMonsterClasses(monster.type)"
      >
        <div class="monster-info">
          <h3>{{ getMonsterTitle(monster.type) }}</h3>
          <p>Count: {{ monster.count }}</p>
          <p class="drink"><strong>Drink:</strong> {{ getMonsterDrink(monster.type) }}</p>
        </div>
        <div class="monster-actions">
          <button @click="attackMonster(index)" :disabled="monster.count <= 0">
            Attack
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="allMonstersDefeated" class="victory-message">
      <h3>All monsters defeated!</h3>
      <button @click="leavePub">Leave Pub</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore.js";
import {useQuestStore} from "../stores/questStore.js";
import {monsterTypes} from "../data/monsterTypes";
import {computed} from "vue";
import '../styles/monsterStyles.css';

const questStore = useQuestStore()
const appStore = useAppStore()

const allMonstersDefeated = computed(() => {
  if (!questStore.currentPub?.monsters) return false
  return questStore.currentPub.monsters.every(monster => monster.count <= 0)
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
  
  return {
    [`monster-${monster.species}`]: true,
    [`monster-${monster.level}`]: true
  }
}

function attackMonster(index: number) {
  if (questStore.currentPub?.monsters) {
    const monsters = [...questStore.currentPub.monsters]
    if (monsters[index].count > 0) {
      monsters[index].count--
      questStore.currentPub.monsters = monsters
    }
  }
}

function leavePub() {
  appStore.setScreen('map')
  questStore.unsetCurrentPub()
}
</script>

<style scoped>
.location-screen {
  height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
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
  transition: background 0.3s ease;
}

.leave-button:hover {
  background: #d32f2f;
}

.monster-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.monster-info {
  flex: 1;
}

.monster-actions {
  margin-left: 1rem;
}

.drink {
  color: #ffcc00;
  margin-top: 0.5rem;
}

button {
  padding: 0.8rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #666;
  cursor: not-allowed;
}

.victory-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  z-index: 1000;
}

.victory-message h3 {
  margin-bottom: 1rem;
  color: #4CAF50;
}
</style> 