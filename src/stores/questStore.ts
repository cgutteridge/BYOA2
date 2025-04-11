import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {Pub, PubId, QuestState} from '@/types'
import {usePubStore} from './pubStore'

export const useQuestStore = defineStore('quest', () => {
  const pubStore = usePubStore()

  const title = ref<string>('foo')
  const description = ref<string>('foo')
  const status = ref<QuestState>('no_quest')
  const startPubId = ref<PubId | undefined>()
  const endPubId = ref<PubId | undefined>()
  const currentPubId = ref<PubId | undefined>()
  const persist = ref(['title', 'description', 'status', 'startPubId', 'endPubId', 'currentPubId'])


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

  const startQuest = async (title: string, startPub: Pub, endPub: Pub) => {
    setTitle(title)
    setDescription(`Your quest is to reach ${endPub.name}`)
    startPubId.value = startPub.id
    endPubId.value = endPub.id
    setStatus('active')
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
    setCurrentPub,
    unsetCurrentPub,
    endQuest,
    startQuest,
    setStatus,
    setTitle,
    setDescription,
    persist
  }
}) 