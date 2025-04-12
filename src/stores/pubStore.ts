import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {LocationTypeId, Pub, PubId} from '../types'
import {LocationDifficulty} from '../types'
import {useAppStore} from './appStore'
import fetchNearbyPubs from "../helpers/overpass"
import {scoutPub} from '../helpers/scoutPub.ts'

export const usePubStore = defineStore('pub', () => {
  const appStore = useAppStore()
  const persist = ref(['pubs'])

  const pubs = ref<Pub[]>([])

  const setPubs = (newPubs: Pub[]) => {
    pubs.value = newPubs
  }

  // Set difficulty for a specific pub
  const setPubDifficulty = (pubId: PubId, difficulty: LocationDifficulty) => {
    const targetPub = pub(pubId)
    targetPub.difficulty = difficulty
  }

  // Set difficulty for a specific pub
  const setPubType = (pubId: PubId, type: LocationTypeId) => {
    const targetPub = pub(pubId)
    targetPub.locationType = type
  }

  const fetchNearbyPubsFromAPI = async () => {
    if (!appStore.playerLocation) return
    
    appStore.isFetchingPubs = true
    try {
      const { lat, lng } = appStore.playerLocation
      const newPubs = await fetchNearbyPubs(lat, lng, 3000)
      setPubs(newPubs)
    } catch (error) {
      console.error('Error fetching pubs:', error)
      // Set empty pubs array on error
      setPubs([])
    } finally {
      appStore.isFetchingPubs = false
    }
  }

  const pub = (pubId: PubId): Pub => {
    const foundPub = pubs.value.find(p => p.id === pubId)
    if (!foundPub) {
      throw new Error(`Pub with ID ${pubId} not found`)
    }
    return foundPub
  }

  return {
    pubs,
    setPubs,
    fetchNearbyPubs: fetchNearbyPubsFromAPI,
    scoutPub,
    pub,
    setPubDifficulty,
    setPubType,
    persist
  }
}) 