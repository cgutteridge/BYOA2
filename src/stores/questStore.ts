import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {GameLocationId, QuestState} from '@/types'
import {useLocationStore} from './locationStore'
import {useAppStore} from './appStore'
import {useLogStore} from './logStore'
import formatNumber from "@/utils/formatNumber.ts";

export type ThemeType = 'light' | 'dark'

/**
 * Options for logging a quest event
 */
export interface QuestEventOptions {
  xp?: number;
  booze?: number;
  soft?: number;
}

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
  const logStore = useLogStore()

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
  const mapTileId = ref<string>('stamenWatercolor') // Map tile preference, defaulting to stamen watercolor
  const persist = ref(['title', 'description', 'status', 'startGameLocationId',
    'endGameLocationId', 'currentGameLocationId', 'playerCount', 'xp', 'booze', 'soft', 'theme', 'minimumLocations',
    'tokenTitle', 'tokenDescription', 'scoutRange', 'isDebugMode', 'mapTileId'])

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
  
  // Function to calculate level based on XP (1 level per 100 XP)
  const level = computed((): number => xpToLevel(xp.value))

  const xpToLevel = (xpValue: number | undefined) => {
    if (!xpValue) {
      return 1
    }
    return Math.floor(xpValue / 100) + 1
  }

  const levelProgress = computed((): number => {
    if (!xp.value) {
      return 0
    }
    return xp.value % 100
  })

  // Set XP and recalculate level
  const setXP = (newXP: number) => {
    xp.value = newXP
  }

  // Add XP and recalculate level
  const addXP = (amount: number) => {
    const oldLevel = xpToLevel(xp.value)
    xp.value += amount
    const newLevel = xpToLevel(xp.value)
    if (newLevel > oldLevel) {
      let levelCounter: number = oldLevel
      while (levelCounter < newLevel) {
        levelCounter++
        logAndNotifyQuestEvent(`⭐️ LEVEL UP! - You are now Level ${levelCounter}.`)
      }
    }
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
   * Updates stats, adds a notification, and logs the quest event
   * Only mentions stats that actually changed
   * 
   * @param event - Description of the action (e.g., "defeating water boss")
   * @param options - Options containing xp, booze, and soft amounts to add
   */
  const logAndNotifyQuestEvent = (event: string, options: QuestEventOptions = {}) => {
    const xpAmount = options.xp || 0;
    const boozeAmount = options.booze || 0;
    const softAmount = options.soft || 0;
    
    // Update the stats
    if (xpAmount != 0) addXP(xpAmount);
    if (boozeAmount != 0) addBooze(boozeAmount);
    if (softAmount != 0) addSoft(softAmount);

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

    // Create the notification message with XP and Booze info (but not soft)
    const notificationMessage = `${event} ${parts.join(', ')}`;
    
    // Add to the log store with just the event message and the full options object
    logStore.addLogEntry(event, options);
    
    // Pass the notification message with XP/Booze details to the notification system
    appStore.addNotification(notificationMessage, 'info', 10000);
  }
  
  const endQuest = () => {
    // Reset quest-specific data but maintain global player stats
    status.value = 'no_quest'
    startGameLocationId.value = undefined
    endGameLocationId.value = undefined
    currentGameLocationId.value = undefined
    
    // Go back to intro screen
    appStore.setScreen('start_quest')
    
    // Reset app state
    appStore.closeInterface()
    appStore.closeItemInspectModal()
    appStore.setInventoryTab('inventory')
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

  // Map tile preference management
  const setMapTileId = (newMapTileId: string): void => {
    mapTileId.value = newMapTileId
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
    level,
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
    levelProgress,
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
    getGradient,
    mapTileId,
    setMapTileId,
  }
}) 