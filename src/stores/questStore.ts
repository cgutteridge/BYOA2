import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type { PubId, QuestState} from '@/types'
import {usePubStore} from './pubStore'
import {useAppStore} from './appStore'
import formatNumber from "@/utils/formatNumber.ts";

export const useQuestStore = defineStore('quest', () => {
  const pubStore = usePubStore()
  const appStore = useAppStore()

  const title = ref<string>('foo')
  const description = ref<string>('foo')
  const status = ref<QuestState>('no_quest')
  const startPubId = ref<PubId | undefined>()
  const endPubId = ref<PubId | undefined>()
  const currentPubId = ref<PubId | undefined>()
  const playerCount = ref<number>(3)
  const difficulty = ref<number>(1)
  const xp = ref<number>(0)
  const booze = ref<number>(0) // Track alcohol booze consumed
  const soft = ref<number>(0) // Track soft drinks/water consumed
  const persist = ref(['title', 'description', 'status', 'startPubId', 'endPubId', 'currentPubId', 'playerCount', 'xp', 'booze', 'soft'])

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
  
  const setBooze = (newBooze: number) => {
    booze.value = newBooze
  }
  
  const addBooze = (amount: number) => {
    booze.value += amount
  }

  const setSoft = (newSoft: number) => {
    soft.value = newSoft
  }

  const addSoft = (amount: number) => {
    soft.value += amount
  }
  
  /**
   * Updates both XP and booze with a notification message
   * Only mentions stats that actually changed
   * 
   * @param xpAmount - Amount of XP to add (can be 0)
   * @param boozeAmount - Amount of booze to add (can be 0)
   * @param softAmount - Amount of soft drinks to add (can be 0)
   * @param actionDesc - Description of the action (e.g., "defeating water boss")
   */
  const updateStats = (xpAmount: number, boozeAmount: number, softAmount: number, actionDesc: string) => {
    // Update the stats
    if (xpAmount !== 0) xp.value += xpAmount;
    if (boozeAmount !== 0) booze.value += boozeAmount;
    if (softAmount !== 0) soft.value += softAmount;

    // Format booze, soft without decimal for whole numbers
    const boozeDisplay = formatNumber(boozeAmount)

    const parts : string[] = []
    if( xpAmount !== 0 ) {
      parts.push(`${xpAmount} XP`)
    }
    if( boozeAmount !== 0 ) {
      parts.push(`${boozeDisplay} Booze`)
    }
    if( parts.length ===0 ) {
    parts.push("nothing")}
    appStore.addNotification( `Gained ${parts.join(' and ')} for ${actionDesc}`)
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
    booze,
    soft,
    startPubId,
    endPubId,
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
    setBooze,
    addBooze,
    setSoft,
    addSoft,
    updateStats,
    persist
  }
}) 