<template>
  <div class="inventory-screen">
    <h2>Inventory</h2>
    <p class="placeholder">Inventory system coming soon!</p>
    <button class="continue-button" @click="continueToMap">Continue to Map</button>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../stores/appStore.js";

const appStore = useAppStore()

function continueToMap() {
  appStore.setScreen('map')
}
</script>

<style scoped>
.inventory-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  gap: 2rem;
}

.placeholder {
  font-size: 1.2rem;
  color: #888;
}

.continue-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.continue-button:hover {
  background: #45a049;
}
</style> 