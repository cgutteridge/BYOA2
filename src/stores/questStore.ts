import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {GameLocationId, QuestState} from '@/types'
import {useLocationStore} from './locationStore'
import {useAppStore} from './appStore'
import formatNumber from "@/utils/formatNumber.ts";

export type ThemeType = 'light' | 'dark'

// Color system interface
export interface ColorSystem {
  // Text colors
  text: {
    primary: string
    secondary: string
    accent: string
    inverted: string
    warning: string
    danger: string
  }
  // Background colors
  background: {
    primary: string
    secondary: string
    tertiary: string
    accent: string
    modal: string
    card: string
    screenContainer: string
  }
  // Border colors
  border: {
    light: string
    medium: string
    dark: string
    accent: string
  }
  // Button colors
  button: {
    primary: {
      background: string
      text: string
      border: string
      hover: string
    }
    secondary: {
      background: string
      text: string
      border: string
      hover: string
    }
    danger: {
      background: string
      text: string
      border: string
      hover: string
    }
    disabled: {
      background: string
      text: string
      border: string
    }
  }
  // Overlay/backdrop colors
  overlay: {
    background: string
    text: string
  }
  // Gradients
  gradient: {
    primary: string
    secondary: string
  }
}

export const useQuestStore = defineStore('quest', () => {
  const locationStore = useLocationStore()
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
  const theme = ref<ThemeType>('dark') // Theme preference, defaulting to dark
  const minimumLocations = ref<number>(1) // Minimum number of locations required
  const tokenTitle = ref<string>('shard of truth') // Title for token
  const tokenDescription = ref<string>('a shard of truth') // Description for token
  const scoutRange = ref<number>(200) // Scout range in meters
  const isDebugMode = ref<boolean>(false) // Debug mode state
  const persist = ref(['title', 'description', 'status', 'startGameLocationId',
    'endGameLocationId', 'currentGameLocationId', 'playerCount', 'xp', 'booze', 'soft', 'theme', 'minimumLocations',
    'tokenTitle', 'tokenDescription', 'scoutRange', 'isDebugMode'])

  // Color systems for dark and light themes
  const darkColors: ColorSystem = {
    text: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      accent: '#81c784',
      inverted: '#333333',
      warning: '#ffa726',
      danger: '#ef5350'
    },
    background: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#3a3a3a',
      accent: '#2E7D32',
      modal: '#2a2a2a',
      card: 'rgba(255, 255, 255, 0.1)',
      screenContainer: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    },
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(255, 255, 255, 0.3)',
      accent: '#43A047'
    },
    button: {
      primary: {
        background: '#2E7D32',
        text: '#ffffff',
        border: 'transparent',
        hover: '#43A047'
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        text: '#f0f0f0',
        border: 'rgba(255, 255, 255, 0.2)',
        hover: 'rgba(255, 255, 255, 0.15)'
      },
      danger: {
        background: '#c62828',
        text: '#ffffff',
        border: 'transparent',
        hover: '#e53935'
      },
      disabled: {
        background: '#555555',
        text: '#a0a0a0',
        border: 'transparent'
      }
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)',
      text: '#ffffff'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      secondary: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
    }
  }

  const lightColors: ColorSystem = {
    text: {
      primary: '#333333',
      secondary: '#666666',
      accent: '#2E7D32',
      inverted: '#ffffff',
      warning: '#f57c00',
      danger: '#d32f2f'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#e0e0e0',
      accent: '#43A047',
      modal: '#ffffff',
      card: '#f5f5f5',
      screenContainer: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
    },
    border: {
      light: '#e0e0e0',
      medium: '#d0d0d0',
      dark: '#b0b0b0',
      accent: '#43A047'
    },
    button: {
      primary: {
        background: '#43A047',
        text: '#ffffff',
        border: 'transparent',
        hover: '#2E7D32'
      },
      secondary: {
        background: '#f5f5f5',
        text: '#333333',
        border: '#d0d0d0',
        hover: '#e0e0e0'
      },
      danger: {
        background: '#e53935',
        text: '#ffffff',
        border: 'transparent',
        hover: '#c62828'
      },
      disabled: {
        background: '#cccccc',
        text: '#888888',
        border: 'transparent'
      }
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.3)',
      text: '#333333'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
      secondary: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)'
    }
  }

  // Get current theme's colors
  const colors = computed((): ColorSystem => {
    return theme.value === 'dark' ? darkColors : lightColors
  })

  // Color utility functions
  const getTextColor = (variant: keyof ColorSystem['text'] = 'primary'): string => {
    return colors.value.text[variant]
  }

  const getBackgroundColor = (variant: keyof ColorSystem['background'] = 'primary'): string => {
    return colors.value.background[variant]
  }

  const getBorderColor = (variant: keyof ColorSystem['border'] = 'medium'): string => {
    return colors.value.border[variant]
  }

  const getButtonColors = (variant: keyof ColorSystem['button'] = 'primary'): {
    background: string
    text: string
    border: string
    hover?: string
  } => {
    return colors.value.button[variant]
  }

  const getOverlayColors = (): {
    background: string
    text: string
  } => {
    return colors.value.overlay
  }

  const getGradient = (variant: keyof ColorSystem['gradient'] = 'primary'): string => {
    return colors.value.gradient[variant]
  }

  const setTitle = (newTitle: string) => {
    title.value = newTitle
  }
  const setDescription = (newDescription: string) => {
    description.value = newDescription
  }
  const setStatus = (newStatus: QuestState) => {
    status.value = newStatus
  }
  const setCurrentGameLocation = (locationId: GameLocationId) => {
    currentGameLocationId.value = locationId
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
  
  // Theme management
  const setTheme = (newTheme: ThemeType): void => {
    theme.value = newTheme
  }
  
  const toggleTheme = (): void => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  // Debug mode management
  const setDebugMode = (enabled: boolean): void => {
    isDebugMode.value = enabled
  }
  
  const toggleDebugMode = (): void => {
    isDebugMode.value = !isDebugMode.value
  }
  
  const setMinimumLocations = (count: number): void => {
    minimumLocations.value = count
  }
  
  const setTokenTitle = (newTokenTitle: string): void => {
    tokenTitle.value = newTokenTitle
  }
  
  const setTokenDescription = (newTokenDescription: string): void => {
    tokenDescription.value = newTokenDescription
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
  const logAndNotifyQuestEvent = (xpAmount: number, boozeAmount: number, softAmount: number, actionDesc: string) => {
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
      parts.push("nothing")
    }
    
    // Pass the notification message and XP amount to the notification system
    appStore.addNotification(`${actionDesc} ${parts.join(', ')}`, 'success', 10000, xpAmount);
  }
  
  const endQuest = () => {
    setStatus('no_quest')
  }

  const startGameLocation = computed(() => {
    if (startGameLocationId.value === undefined) {
      return undefined
    }
    return locationStore.location(startGameLocationId.value)
  })
  const endGameLocation = computed(() => {
    if (endGameLocationId.value === undefined) {
      return undefined
    }
    return locationStore.location(endGameLocationId.value)
  })
  const currentGameLocation = computed(() => {
    if (currentGameLocationId.value === undefined) {
      return undefined
    }
    return locationStore.location(currentGameLocationId.value)
  })

  const setScoutRange = (range: number): void => {
    scoutRange.value = range
  }

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
    theme,
    minimumLocations,
    tokenTitle,
    tokenDescription,
    startGameLocationId,
    endGameLocationId,
    isDebugMode,
    setDebugMode,
    toggleDebugMode,
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
    setTheme,
    toggleTheme,
    setMinimumLocations,
    setTokenTitle,
    setTokenDescription,
    logAndNotifyQuestEvent,
    persist,
    scoutRange,
    setScoutRange,
    // Color functions
    colors,
    getTextColor,
    getBackgroundColor,
    getBorderColor,
    getButtonColors,
    getOverlayColors,
    getGradient
  }
}) 