import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {GameLocationId, QuestState} from '@/types'
import {useLocationStore} from './locationStore'
import {useAppStore} from './appStore'
import formatNumber from "@/utils/formatNumber.ts";

export const useQuestStore = defineStore('quest', () => {
  const gameLocationStore = useLocationStore()
  const appStore = useAppStore()

  const title = ref<string>('foo')
  const description = ref<string>('foo')
  const status = ref<QuestState>('no_quest')
  const startGameLocationId = ref<GameLocationId | undefined>()
  const endGameLocationId = ref<GameLocationId | undefined>()
  const currentGameLocationId = ref<GameLocationId | undefined>()
  const playerCount = ref<number>(3)
  const difficulty = ref<number>(1)
  const xp = ref<number>(0)
  const booze = ref<number>(0) // Track alcohol booze consumed
  const soft = ref<number>(0) // Track soft drinks/water consumed
  const persist = ref(['title', 'description', 'status', 'startGameLocation' +
  'Id', 'endGameLocation' +
  'Id', 'currentGameLocation' +
  'Id', 'playerCount', 'xp', 'booze', 'soft'])

  const setTitle = (newTitle: string) => {
    title.value = newTitle
  }
  const setDescription = (newDescription: string) => {
    description.value = newDescription
  }
  const setStatus = (newStatus: QuestState) => {
    status.value = newStatus
  }
  const setCurrentGameLocation = (gameLocationId: GameLocationId) => {
    currentGameLocationId.value = gameLocationId
  }
  const unsetCurrentGameLocation = () => {
    currentGameLocationId.value = undefined
  }
  const setPlayerCount = (count: number) => {
    playerCount.value = count
  }
  const setDifficulty = (questDifficulty: number) => {
    difficulty.value = questDifficulty
  }
  const setStartGameLocationId = (id: GameLocationId) => {
    startGameLocationId.value = id
  }
  const setEndGameLocationId = (id: GameLocationId) => {
    endGameLocationId.value = id
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
    if (xpAmount != 0) xp.value += xpAmount;
    if (boozeAmount != 0) booze.value += boozeAmount;
    if (softAmount != 0) soft.value += softAmount;

    // Format booze, soft without decimal for whole numbers
    const boozeDisplay = formatNumber(boozeAmount,true)
    const xpDisplay = formatNumber(xpAmount,true)
    const parts : string[] = []
    if( xpAmount != 0 && !Number.isNaN(xpAmount) ) {
      parts.push(`${xpDisplay} XP`)
    }
    if( boozeAmount != 0 && !Number.isNaN(boozeAmount) ) {
      parts.push(`${boozeDisplay} Booze`)
    }
    if( parts.length ==0 ) {
    parts.push("nothing")}
    appStore.addNotification( `${actionDesc} ${parts.join(', ')}`)
  }
  
  const endQuest = () => {
    setStatus('no_quest')
  }

  const startGameLocation = computed(() => {
    if (startGameLocationId.value === undefined) {
      return undefined
    }
    return gameLocationStore.gameLocation(startGameLocationId.value)
  })
  const endGameLocation = computed(() => {
    if (endGameLocationId.value === undefined) {
      return undefined
    }
    return gameLocationStore.gameLocation(endGameLocationId.value)
  })
  const currentGameLocation = computed(() => {
    if (currentGameLocationId.value === undefined) {
      return undefined
    }
    return gameLocationStore.gameLocation(currentGameLocationId.value)
  })

  return {
    startGameLocation,
    endGameLocation,
    currentGameLocationId,
    status,
    title,
    description,
    currentGameLocation,
    playerCount,
    difficulty,
    xp,
    booze,
    soft,
    startGameLocationId,
    endGameLocationId,
    setStartGameLocationId,
    setEndGameLocationId,
    setCurrentGameLocation,
    unsetCurrentGameLocation,
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