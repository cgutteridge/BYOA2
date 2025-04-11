import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {LocationType, Pub, PubId} from '../types'
import {useAppStore} from './appStore'
import {locationTypes} from '../data/locationTypes'
import fetchNearbyPubs from "../helpers/overpass";
import {ChatGPTAPI} from "../api/chatGPT";

export const usePubStore = defineStore('pub', () => {
  const appStore = useAppStore()
  const persist = ref(['pubs'])

  const pubs = ref<Pub[]>([])

  const setPubs = (newPubs: Pub[]) => {
    pubs.value = newPubs
  }

  const getLocationTypeData = (typeId: string) : LocationType => {
    return locationTypes.find(type => type.id === typeId) as LocationType
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

  const scoutPub = async (pubId: PubId) => {
    const chatGPT = new ChatGPTAPI()

    const pubToScout = pub(pubId)
    pubToScout.scouted = true
    const locationType = getLocationTypeData(pubToScout.locationType)

    const {
      name,
      description,
      prizeName,
      prizeDescription
    } = await chatGPT.generatePubDescription(pubToScout.name, locationType.title, "3 Orks", "an item that lets you defeat any single enemy. Single use..")
    pubToScout.name = name
    pubToScout.prizeName = prizeName
    pubToScout.prizeDescription = prizeDescription
    pubToScout.description = description

    return true
  }


  return {
    pubs,
    setPubs,
    getLocationTypeData,
    fetchNearbyPubs: fetchNearbyPubsFromAPI,
    scoutPub,
    pub,
    persist
  }
}) 