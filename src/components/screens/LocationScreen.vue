<template>
  <div class="location-screen" :style="{ background: questStore.getBackgroundColor('primary') }">
    <div class="location-header" :style="headerStyle">
      <h2>{{ questStore.currentGameLocation?.name }}</h2>
    </div>

    <!-- GameLocation description section -->
    <div class="location-description-section" v-if="questStore.currentGameLocation?.description">
      <StoryBlock>
        {{ questStore.currentGameLocation.description }}
      </StoryBlock>
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

    <div v-if="questStore.currentGameLocation?.wares" class="gift-info" :style="sectionStyle">
      <h3>Wares:</h3>
      <div v-for="item in questStore.currentGameLocation.wares" style="margin-bottom: 0.5rem">
        <ItemCard
            :item="item"
            variant="gift"
            :show-details="true"
            @action="claimShopItem"
        />
      </div>
    </div>

    <div class="combat-container" v-if="showCombat" :style="combatContainerStyle">
      <!-- All monsters in a 3-column flex layout with active ones first -->
      <div class="monsters-container">
        <template v-for="monster in sortedMonsters" :key="monster.id">
          <MonsterCard
              v-if="monster.alive || (monster.item && !monster.alive)"
              :monster="monster"
          />
        </template>
      </div>
    </div>

    <!-- Prize item section -->
    <div v-if="questStore.currentGameLocation?.prizeItem || questStore.currentGameLocation?.hasToken"
         class="prize-item-section" :style="sectionStyle">
      <h3><span class="icon">🏆</span> Quest Prize:</h3>
      <div class="prize-item-wrapper" v-if="questStore.currentGameLocation?.prizeItem">
        <div v-if="!allMonstersDefeated" class="item-locked">
          <span class="lock-icon">🔒</span>
        </div>
        <ItemCard
            :item="questStore.currentGameLocation?.prizeItem"
            variant="prize"
            :show-details="true"
            :locked="!allMonstersDefeated"
            @action="claimPrizeItem"
        />
      </div>
      <div class="prize-item-wrapper" v-if="questStore.currentGameLocation.hasToken">
        <div v-if="!allMonstersDefeated" class="item-locked">
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
</template>

<script setup lang="ts">
import {useAppStore} from "@/stores/appStore";
import {useQuestStore} from "@/stores/questStore";
import {GameLocation, Item} from "@/types";
import '@/styles/monsterAnimations.css';
import {computed} from 'vue';
import {useInventoryStore} from "@/stores/inventoryStore";
import {useLocationStore} from "@/stores/locationStore";
import {useLogStore} from "@/stores/logStore";
import ItemCard from "@/components/ItemCard.vue";
import ButtonInput from "@/components/forms/ButtonInput.vue";
import {areAllMonstersDefeated} from "@/quest/monsterUtils";
import {generateTokenItem} from "@/quest/itemUtils";
import MonsterCard from "@/components/MonsterCard.vue";
import StoryBlock from "@/components/StoryBlock.vue";

const questStore = useQuestStore()
const appStore = useAppStore()
const inventoryStore = useInventoryStore()
const locationStore = useLocationStore()
const logStore = useLogStore()

// Theme-based styles
const headerStyle = computed(() => ({
  // backgroundColor: questStore.getBackgroundColor('secondary'),
  color: questStore.getTextColor('primary'),
  // borderBottom: `1px solid ${questStore.getBorderColor('medium')}`,
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

// Compute whether all monsters are defeated here
const monstersHaveItems = computed((): boolean => {
  return questStore.currentGameLocation?.monsters
      ? questStore.currentGameLocation.monsters.some(monster => monster.item !== undefined)
      : false
})

const showCombat = computed(() => {
  return questStore.currentGameLocation?.monsters && !allMonstersDefeated.value || monstersHaveItems.value
})

// Dynamically generate the regular token item when needed
const tokenItem = computed(() => {
  // when we are in a location the currentLocation will always be set
  return generateTokenItem(questStore.currentGameLocation as GameLocation);
})

function leaveLocation() {
  // Add log entry before changing screen or unsetting location
  if (questStore.currentGameLocation) {
    logStore.addLogEntry(`Left ${questStore.currentGameLocation.name}.`);
  }

  appStore.setScreen('map')
  questStore.unsetCurrentGameLocation()
}

function claimGiftItem() {
  if (questStore.currentGameLocation?.giftItem) {
    const giftItem = questStore.currentGameLocation.giftItem;

    // Add to inventory
    inventoryStore.addItem(giftItem);

    // Award XP based on item level
    if (giftItem.level) {
      const xpToAward = giftItem.level * 2; // 2 XP per level for gift items
      questStore.logAndNotifyQuestEvent(`Claimed ${giftItem.name}.`, {xp: xpToAward});
    }

    // Remove from GameLocation
    delete questStore.currentGameLocation.giftItem;
  }
}

function claimShopItem(item: Item) {

  // Add to inventory
  inventoryStore.addItem(item);

  // Award XP based on item level
  if (item.level) {
    const xpToAward = item.level * 2; // 2 XP per level for gift items
    questStore.logAndNotifyQuestEvent(`Purchased ${item.name}.`, {xp: xpToAward});
  }

  // Remove from GameLocation
  delete questStore.currentGameLocation?.wares
}

function claimPrizeItem() {
  if (allMonstersDefeated.value && questStore.currentGameLocation?.prizeItem) {
    const prizeItem = questStore.currentGameLocation.prizeItem;

    // Add to inventory
    inventoryStore.addItem(prizeItem);

    // Award XP based on item level
    if (prizeItem.level) {
      const xpToAward = prizeItem.level * 3; // 3 XP per level for prize items
      questStore.logAndNotifyQuestEvent(`Claimed ${prizeItem.name}.`, {xp: xpToAward});
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

    questStore.logAndNotifyQuestEvent(`Claimed ${tokenItem.value.name}.`, {xp: 10});
  }
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
}

.location-header h2 {
  font-size: 2rem;
  margin: 0;
  padding: 0 50px;
}

.location-description-section {
  margin-bottom: 2rem;
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

.item-locked {
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
  border-radius: 8px;
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
</style> 