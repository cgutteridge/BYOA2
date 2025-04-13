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
      <!-- Group monsters by type for display -->
      <div v-for="(monsterGroup, groupIndex) in groupedMonsters" :key="groupIndex" class="monster-group">
        <div class="group-header">
          <div class="group-title">{{ getMonsterTitle(monsterGroup.type) }}</div>
          <div class="group-subinfo">{{ getMonsterSpecies(monsterGroup.type) }} {{ getMonsterLevel(monsterGroup.type) }}{{ getMonsterTraits(monsterGroup.type) }}</div>
          <div class="group-drink"><strong>Drink:</strong> {{ getMonsterDrink(monsterGroup.type) }}</div>
          <div class="group-xp">{{ getMonsterXP(monsterGroup.type) }} XP</div>
        </div>
        
        <div class="monsters-container location-monsters">
          <div 
            v-for="(monster, monsterIndex) in monsterGroup.monsters" 
            :key="monsterIndex"
            class="monster-card"
            :class="[getMonsterClasses(monster.type), { 'defeated': !monster.alive }]"
            @click="toggleMonsterStatus(monster)"
          >
            <div class="monster-info">
              <div class="monster-name">{{ monster.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="monsterGroup.items.length > 0" class="monster-items-section">
          <h4>Monster Items</h4>
          <div v-for="(monster, monsterIndex) in monsterGroup.items" :key="monsterIndex">
            <div v-if="monster.item" class="item-card" :class="{'item-card-level4': monster.item.level === 4, 'item-card-level5': monster.item.level === 5}">
              <div class="item-name" :class="{'item-name-level4': monster.item.level === 4, 'item-name-level5': monster.item.level === 5}">
                {{ monster.item.name }}
              </div>
              <div class="item-power">{{ monster.item.power }}</div>
              <div v-if="monster.item.description" class="item-description">
                <span class="description-label">Story:</span> {{ monster.item.description }}
              </div>
              <div class="item-details">
                <span class="item-type">Type: {{ getItemTypeName(monster.item.type, monster.item.level) }}</span>
                <span class="item-level" :class="{'item-level-4': monster.item.level === 4, 'item-level-5': monster.item.level === 5}">
                  Level: {{ monster.item.level }}
                </span>
                <span class="item-uses">Uses: {{ monster.item.uses }}</span>
                <span class="item-target" v-if="monster.item.target">
                  Target: {{ monster.item.target }}
                </span>
              </div>
              <button class="take-item-btn" :class="{'take-item-btn-level4': monster.item.level === 4, 'take-item-btn-level5': monster.item.level === 5}" :disabled="monster.alive">
                {{ !monster.alive ? 'Claim Item' : 'Defeat monster to claim' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Prize item section - shown when all monsters are defeated -->
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

// Group monsters by type for display
const groupedMonsters = computed(() => {
  if (!questStore.currentPub?.monsters || !questStore.currentPub.monsters.length) {
    return [];
  }
  
  // Group monsters by type
  const monstersByType = new Map<string, {
    type: string,
    monsters: Monster[],
    items: Monster[]
  }>();
  
  questStore.currentPub.monsters.forEach(monster => {
    if (!monstersByType.has(monster.type)) {
      monstersByType.set(monster.type, {
        type: monster.type,
        monsters: [],
        items: []
      });
    }
    
    const group = monstersByType.get(monster.type)!;
    group.monsters.push(monster);
    
    // If monster has an item, add it to the items list
    if (monster.item) {
      group.items.push(monster);
    }
  });
  
  // Convert Map to array for v-for
  return Array.from(monstersByType.values());
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

.monster-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.monster-group.defeated {
  opacity: 0.6;
  background: rgba(100, 100, 100, 0.1);
}

.group-header {
  margin-bottom: 1.5rem;
  text-align: left;
  position: relative;
}

.group-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #ffeb3b;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding-right: 70px; /* Make room for XP */
}

.group-subinfo {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  font-style: italic;
}

.group-drink, .group-xp {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.group-xp {
  position: absolute;
  top: 0.25rem;
  right: 0;
  font-size: 0.95rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-weight: bold;
}

.monsters-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.monster-card {
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monster-card.defeated {
  opacity: 0.5;
  filter: grayscale(1);
}

.monster-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.monster-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.monster-items-section {
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1.5rem;
}

.monster-items-section h4 {
  color: #ffeb3b;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
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

.location-monsters .monster-card {
  /* Allow monster type colors to show through */
}

.location-monsters .monster-name {
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