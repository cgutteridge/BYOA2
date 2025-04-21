<template>
  <div class="log-tab">
    <h2>Quest Log</h2>
    
    <div class="log-introduction">
      <p>Your journey is tracked here. Major events, battles, and discoveries will be recorded.</p>
    </div>
    
    <div class="log-entries">
      <!-- Placeholder entries that would normally come from the questStore -->
      <div class="log-entry">
        <div class="log-entry-time">Just now</div>
        <div class="log-entry-message">You accessed the quest log for the first time.</div>
      </div>
      
      <div class="log-entry">
        <div class="log-entry-time">Earlier</div>
        <div class="log-entry-message">You started your adventure.</div>
      </div>
      
      <div class="log-entry">
        <div class="log-entry-time">At the beginning</div>
        <div class="log-entry-message">Your quest began. Excitement and danger await!</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Future implementation will pull actual log entries from logStore
import {useQuestStore} from "@/stores/questStore.ts";

const questStore = useQuestStore()

</script>

<style scoped>
.log-tab h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
}

.log-introduction {
  margin-bottom: 2rem;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.log-entries {
  display: flex;
  flex-direction: column-reverse; /* Most recent on top */
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.log-entry {
  padding: 1rem;
  border-radius: 8px;
  background-color: v-bind('questStore.getBackgroundColor("tertiary")');
  border: 1px solid v-bind('questStore.getBorderColor("light")');
}

.log-entry-time {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
  color: v-bind('questStore.getTextColor("secondary")');
}

.log-entry-message {
  font-size: 1rem;
  color: v-bind('questStore.getTextColor("primary")');
}
</style> 
