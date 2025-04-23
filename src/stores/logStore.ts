import { defineStore } from 'pinia'
import { ref } from 'vue'
import { QuestEventOptions } from './questStore'

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string in UTC
  message: string;
  change: QuestEventOptions;
}

export const useLogStore = defineStore('log', () => {
  const logEntries = ref<LogEntry[]>([]);
  const persist = ref(['logEntries']); // Add this to persist logs between sessions

  /**
   * Add a log entry with the provided message and changes
   */
  const addLogEntry = (message: string, change: QuestEventOptions = {}): void => {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    
    logEntries.value.push({
      id,
      timestamp,
      message,
      change
    });
  };

  /**
   * Get all log entries sorted by most recent first
   */
  const getLogEntries = (): LogEntry[] => {
    return [...logEntries.value].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  /**
   * Group log entries by hour in local time
   */
  const getGroupedByHourEntries = (): Record<string, LogEntry[]> => {
    const grouped: Record<string, LogEntry[]> = {};
    
    logEntries.value.forEach(entry => {
      const date = new Date(entry.timestamp);
      
      // Format: "Monday 8th July - 7pm"
      const day = date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      
      // Get hour in 12-hour format
      const hour = date.getHours();
      const hourDisplay = hour === 0 ? '12am' :
                         hour < 12 ? `${hour}am` :
                         hour === 12 ? '12pm' :
                         `${hour-12}pm`;
      
      const groupKey = `${day} - ${hourDisplay}`;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      
      grouped[groupKey].push(entry);
    });
    
    // Sort entries within each group by most recent first
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
    
    // Sort the groups by time (most recent first)
    const sortedGroups: Record<string, LogEntry[]> = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const aEntries = grouped[a];
        const bEntries = grouped[b];
        const aLatestTime = new Date(aEntries[0].timestamp).getTime();
        const bLatestTime = new Date(bEntries[0].timestamp).getTime();
        return bLatestTime - aLatestTime;
      })
      .forEach(key => {
        sortedGroups[key] = grouped[key];
      });
    
    return sortedGroups;
  };

  /**
   * Clear all log entries
   */
  const clearLog = (): void => {
    logEntries.value = [];
  };

  return {
    logEntries,
    persist,
    addLogEntry,
    getLogEntries,
    getGroupedByHourEntries,
    clearLog
  };
}); 