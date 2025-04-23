<template>
  <div class="log-tab">
    <h2>Quest Log</h2>
    
    <div class="log-introduction" v-if="Object.keys(groupedEntries).length === 0">
      <p>Your journey is tracked here. Major events, battles, and discoveries will be recorded.</p>
    </div>
    
    <div class="log-entries">
      <div v-for="(entries, hourGroup) in groupedEntries" :key="hourGroup" class="log-hour-group">
        <div class="log-entries-container">
          <h3 class="log-hour-header">{{ hourGroup }}</h3>
          
          <div v-for="entry in entries" :key="entry.id" class="log-entry">
            <span class="log-entry-time">{{ formatTime(entry.timestamp) }}</span>
            - {{ entry.message }}
            <span v-if="entry.change?.xp && entry.change.xp > 0" class="log-entry-xp">+{{ entry.change.xp }} XP</span>
            <span v-if="entry.change?.booze && entry.change.booze > 0" class="log-entry-booze">+{{ entry.change.booze }} Booze</span>
            <span v-if="entry.change?.soft && entry.change.soft > 0" class="log-entry-soft">+{{ entry.change.soft }} Soft</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogStore } from '@/stores/logStore';
import { useQuestStore } from '@/stores/questStore';
import { computed } from 'vue';

const questStore = useQuestStore();
const logStore = useLogStore();

const groupedEntries = computed(() => {
  return logStore.getGroupedByHourEntries();
});

/**
 * Format timestamp to local time (HH:MM)
 */
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
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
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.log-hour-group {
  display: flex;
  flex-direction: column;
}

.log-entries-container {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: v-bind('questStore.getBackgroundColor("tertiary")');
  border: 1px solid v-bind('questStore.getBorderColor("light")');
}

.log-hour-header {
  padding: 0.5rem;
  margin: -0.5rem -0.75rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid v-bind('questStore.getBorderColor("light")');
  color: v-bind('questStore.getTextColor("secondary")');
}

.log-entry {
  padding: 0.25rem 0;
  font-size: 0.95rem;
  line-height: 1.4;
  color: v-bind('questStore.getTextColor("primary")');
}

.log-entry:not(:last-child) {
  border-bottom: 1px solid v-bind('questStore.getBorderColor("light")');
  border-bottom-style: dashed;
}

.log-entry-time {
  font-weight: 500;
  color: v-bind('questStore.getTextColor("secondary")');
}

.log-entry-xp {
  color: #4CAF50;
  font-weight: 600;
  margin-left: 0.5rem;
}

.log-entry-booze {
  color: #F57C00;
  font-weight: 600;
  margin-left: 0.5rem;
}

.log-entry-soft {
  color: #2196F3;
  font-weight: 600;
  margin-left: 0.5rem;
}
</style> 
