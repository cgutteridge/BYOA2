<template>
  <div class="map-tile-selector">
    <ListInput
      title="Map Style"
      :options="tileOptions"
      v-model="selectedMapTile"
      :searchable="true"
      placeholder="Search map styles..."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import mapTiles from '@/data/mapTiles'
import { useQuestStore } from '@/stores/questStore'
import ListInput from '@/components/forms/ListInput.vue'

const questStore = useQuestStore()

// Convert map tiles to format expected by ListInput with more detailed information
const tileOptions = computed(() => {
  return Object.entries(mapTiles).map(([id, tile]) => {
    // Determine if this tile needs an API key and if it's included
    const apiKeyStatus = tile.apiKeyRequired ? ' (API key included)' : ''
    
    // Create a more descriptive subtitle with zoom and attribution info
    const subtitle = `Max zoom: ${tile.maxZoom}${apiKeyStatus}`
    
    return {
      id,
      name: tile.name,
      subtitle: subtitle
    }
  })
})

// Create computed property for two-way binding
const selectedMapTile = computed({
  get: () => questStore.mapTileId || 'pioneer',
  set: (id: string) => {
    if (id) {
      questStore.setMapTileId(id)
    }
  }
})
</script>

<style scoped>
.map-tile-selector {
  margin-bottom: 1.5rem;
}
</style> 