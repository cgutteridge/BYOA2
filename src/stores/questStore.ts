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
  const persist = ref(['title', 'description', 'status', 'startPubId', 'endPubId', 'currentPubId', 'playerCount'])

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
    status,
    title,
    description,
    currentPub,
    playerCount,
    difficulty,
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
    persist
  }
}) 