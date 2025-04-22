<template>
  <Teleport to="body">
    <div v-if="isOpen" class="interface-modal">
      <div class="interface-modal__backdrop" :style="backdropStyle" @click="close"></div>
      
      <div class="interface-modal__content" :style="modalContentStyle">
        <div class="interface-modal__header" :style="headerStyle">
          <div class="interface-modal__tabs">
            <div
              v-for="tab in tabs" 
              :key="tab.id"
              class="interface-modal__tab"
              :class="{ 'interface-modal__tab--active': activeTab === tab.id }"
              :aria-disabled="tab.disabled"
              @click="!tab.disabled && (activeTab = tab.id)"
            >
              {{ tab.label }}
            </div>
          </div>
          
          <button class="interface-modal__close" @click="close">
            ×
          </button>
        </div>
        
        <div class="interface-modal__body" :style="bodyStyle">
          <!-- Items Tab -->
          <InventoryTab v-if="activeTab === 'items'" />
          
          <!-- Quest Tab -->
          <QuestTab v-else-if="activeTab === 'quest'" />
          
          <!-- Log Tab -->
          <LogTab v-else-if="activeTab === 'log'" />
          
          <!-- Options Tab -->
          <OptionsTab v-else-if="activeTab === 'options'" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useQuestStore } from '@/stores/questStore'
import InventoryTab from '@/components/tabs/InventoryTab.vue'
import QuestTab from '@/components/tabs/QuestTab.vue'
import LogTab from '@/components/tabs/LogTab.vue'
import OptionsTab from '@/components/tabs/OptionsTab.vue'

// Stores
const appStore = useAppStore()
const questStore = useQuestStore()

const isOpen = computed(() => appStore.isInterfaceOpen)

// Computed
const activeTab = computed({
  get: () => appStore.inventoryTab,
  set: (value) => appStore.setInventoryTab(value)
})

// Tabs
const tabs = [
  { id: 'items', label: 'Items', disabled: false },
  { id: 'quest', label: 'Quest', disabled: false },
  { id: 'log', label: 'Log', disabled: false },
  { id: 'options', label: 'Options', disabled: false }
]

// Theme-based styles
const backdropStyle = computed(() => ({
  backgroundColor: questStore.getOverlayColors().background,
}))

const modalContentStyle = computed(() => ({
  backgroundColor: questStore.getBackgroundColor('modal'),
  color: questStore.getTextColor('primary'),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
}))

const headerStyle = computed(() => ({
  borderBottom: `1px solid ${questStore.getBorderColor('light')}`,
}))

const bodyStyle = computed(() => ({
  color: questStore.getTextColor('primary'),
}))

// Methods
function close(): void {
  appStore.closeInterface()
}
</script>

<style scoped>
.interface-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.interface-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(2px);
}

.interface-modal__content {
  position: relative;
  width: 90%;
  height: 90%;
  max-width: 1200px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.interface-modal__header {
  padding: 0.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interface-modal__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid transparent;
  overflow-x: auto;
  -ms-overflow-style: none;  /* Hide scrollbar for IE and Edge */
  scrollbar-width: none;  /* Hide scrollbar for Firefox */
}

.interface-modal__tabs::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome, Safari, and Opera */
}

.interface-modal__tab {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  font-size: 1.05rem;
  transition: background-color 0.2s ease;
}

.interface-modal__tab--active {
  font-weight: 600;
  color: inherit;
  position: relative;
}

.interface-modal__tab--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: currentColor;
}

.interface-modal__tab[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

.interface-modal__close {
  padding: 0 1rem;
  font-size: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
}

.interface-modal__body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.interface-tab h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
}

.interface-tab h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
}

/* Media queries for responsive design */
@media screen and (max-width: 767px) {
  .interface-modal__content {
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .interface-modal__header {
    padding: 0.75rem 0.5rem 0.75rem 0.75rem;
  }
  
  .interface-modal__tabs {
    flex: 1;
    margin-right: 0.5rem;
  }
  
  .interface-modal__tab {
    padding: 0.4rem 0.6rem;
    font-size: 1rem;
  }
  
  .interface-modal__close {
    padding: 0 1rem;
    font-size: 2rem;
  }

  .interface-modal__body {
    padding: 0.75rem;
  }
  
  .interface-tab h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .interface-tab h3 {
    font-size: 1.1rem;
  }
}

@media screen and (max-width: 360px) {
  .interface-modal__tab {
    padding: 0.35rem 0.5rem;
    font-size: 0.95rem;
  }
  
  .interface-modal__header {
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  }
}
</style> 