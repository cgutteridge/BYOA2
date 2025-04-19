<template>
  <div class="quest-info">
    <h2>{{ questStore.title }}</h2>
    <p class="description">{{ questStore.description }}</p>
    
    <div class="gameLocation-info">
      <div class="start-gameLocation">
        <h3>Start GameLocation</h3>
        <p>{{ questStore.startGameLocation?.name || 'Not selected' }}</p>
      </div>
      
      <div class="end-gameLocation">
        <h3>End GameLocation</h3>
        <p>{{ questStore.endGameLocation?.name || 'Not selected' }}</p>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { useQuestStore } from '@/stores/questStore';
import MonsterTypeStats from '@/components/MonsterTypeStats.vue';

const questStore = useQuestStore();

</script>

<style scoped>
.quest-info {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.description {
  font-size: 1.2rem;
  margin: 2rem 0;
  line-height: 1.6;
}

.gameLocation-info {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  gap: 2rem;
}

.start-gameLocation, .end-gameLocation {
  flex: 1;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
</style> 