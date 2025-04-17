import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type { PubId, QuestState} from '@/types'
import {usePubStore} from './pubStore'

export const useQuestStore = defineStore('quest', () => {
  const pubStore = usePubStore()

  const title = ref<string>('foo')
  const description = ref<string>('foo')
  const status = ref<QuestState>('no_quest')
  const startPubId = ref<PubId | undefined>()
  const endPubId = ref<PubId | undefined>()
  const currentPubId = ref<PubId | undefined>()
  const playerCount = ref<number>(3)
  const difficulty = ref<number>(1)
  const xp = ref<number>(0)
  const units = ref<number>(0) // Track alcohol units consumed
  const persist = ref(['title', 'description', 'status', 'startPubId', 'endPubId', 'currentPubId', 'playerCount', 'xp', 'units'])

  const setTitle = (newTitle: string) => {
    title.value = newTitle
  }
  const setDescription = (newDescription: string) => {
    description.value = newDescription
  }
  const setStatus = (newStatus: QuestState) => {
    status.value = newStatus
  }
  const setCurrentPub = (pubId: PubId) => {
    currentPubId.value = pubId
  }
  const unsetCurrentPub = () => {
    currentPubId.value = undefined
  }
  const setPlayerCount = (count: number) => {
    playerCount.value = count
  }
  const setDifficulty = (questDifficulty: number) => {
    difficulty.value = questDifficulty
  }
  const setStartPubId = (id: PubId) => {
    startPubId.value = id
  }
  const setEndPubId = (id: PubId) => {
    endPubId.value = id
  }
  
  const setXP = (newXP: number) => {
    xp.value = newXP
  }
  
  const addXP = (amount: number) => {
    xp.value += amount
  }
  
  const setUnits = (newUnits: number) => {
    units.value = newUnits
  }
  
  const addUnits = (amount: number) => {
    units.value += amount
  }
  
  const endQuest = () => {
    setStatus('no_quest')
  }

  const startPub = computed(() => {
    if (startPubId.value === undefined) {
      return undefined
    }
    return pubStore.pub(startPubId.value)
  })
  const endPub = computed(() => {
    if (endPubId.value === undefined) {
      return undefined
    }
    return pubStore.pub(endPubId.value)
  })
  const currentPub = computed(() => {
    if (currentPubId.value === undefined) {
      return undefined
    }
    return pubStore.pub(currentPubId.value)
  })

  return {
    startPub,
    endPub,
    currentPubId,
    status,
    title,
    description,
    currentPub,
    playerCount,
    difficulty,
    xp,
    units,
    setStartPubId,
    setEndPubId,
    setCurrentPub,
    unsetCurrentPub,
    endQuest,
    setStatus,
    setTitle,
    setDescription,
    setPlayerCount,
    setDifficulty,
    setXP,
    addXP,
    setUnits,
    addUnits,
    persist
  }
}) 