<template>
  <div class="pub-view">
    <h1>{{ questStore.currentLocation.name }}</h1>
    <p>Welcome to the pub! More content coming soon...</p>
    <button @click="exitPub">Exit Pub</button>
  </div>
</template>

<script setup>
import { useQuestStore } from '../stores/questStore.js'

const questStore = useQuestStore()

function exitPub() {
  questStore.setGameMode('map')
}
</script>

<style>
.pub-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style> 