<template>
  <div class="log-tab">
    <h2>Quest Chronicle</h2>
    
    <div class="log-introduction" v-if="Object.keys(groupedEntries).length === 0">
      <p>Your journey is tracked here. Major events, battles, and discoveries will be recorded.</p>
    </div>
    
    <div class="log-entries">
      <div v-for="(entries, hourGroup) in groupedEntries" :key="hourGroup" class="log-hour-group">
        <StoryBlock>
          <h3 class="log-hour-header">{{ hourGroup }}</h3>
          <div v-for="entry in entries" :key="entry.id" class="log-entry">
            <span class="log-entry-time">{{ formatTime(entry.timestamp) }}</span>
            - {{ entry.message }}
            <span v-if="entry.change?.xp && entry.change.xp > 0" class="log-entry-xp">+{{ entry.change.xp }} XP</span>
            <span v-if="entry.change?.booze && entry.change.booze > 0" class="log-entry-booze">+{{ entry.change.booze }} Booze</span>
          </div>
        </StoryBlock>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogStore } from '@/stores/logStore';
import { useQuestStore } from '@/stores/questStore';
import { computed } from 'vue';
import StoryBlock from '@/components/StoryBlock.vue';

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

.log-hour-header {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('questStore.getTextColor("secondary")');
  margin-bottom: 1rem;
  text-align: center;
  border-bottom: 1px solid v-bind('questStore.theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"');
  padding-bottom: 0.5rem;
}

.log-entry {
  padding: 0.25rem 0;
  font-size: 0.95rem;
  line-height: 1.4;
  color: v-bind('questStore.getTextColor("primary")');
}

.log-entry:not(:last-child) {
  border-bottom: 1px solid v-bind('questStore.theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"');
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

</style> 
