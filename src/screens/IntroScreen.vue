<template>
  <div class="intro-screen screen-container">
    <QuestInfo />
  </div>
</template>

<script setup lang="ts">
import QuestInfo from './QuestInfo.vue'
</script>

<style scoped>
.intro-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  padding: 2rem 0;
}
</style> 