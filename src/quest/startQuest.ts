import type {GameLocation} from '@/types'
import {useQuestStore} from "@/stores/questStore.ts";
import { useInventoryStore } from "@/stores/inventoryStore.ts";
import { generateRandomItem } from "@/quest/generateRandomItem.ts";
import type { Item, ItemPowerId } from "@/types";
import { toItemId } from '@/types';
import {useLocationStore} from "@/stores/locationStore.ts";
import initialiseGameLocation from "@/quest/initialiseLocation.ts";
import {scoutLocation} from "@/quest/scoutLocation.ts";
import {ChatGPTAPI} from "@/api/chatGPT.ts";

// Function to create unrestricted debug items with pick and pick_type for each power
function createDebugItems(): Item[] {
  // Define all available powers
  const powers: ItemPowerId[] = [
    'kill', 
    'transmute', 
    'spy',
    'shrink', 
    'split', 
    'pickpocket',
    'banish',
    'freeze',
    'petrify',
    'pacify',
    'distract',
    'vegetate',
    'stun'
  ];
  
  const items: Item[] = [];
  
  // Create a pick item for each power
  powers.forEach(power => {
    // Get capitalized power name for display
    const powerName = power.charAt(0).toUpperCase() + power.slice(1);
    
    // Create pick item (use on individual monster)
    const pickItem: Item = {
      id: toItemId(`debug_pick_${power}_${Date.now()}`),
      name: `DEBUG ${powerName} (Use on Monster)`,
      description: `Debug item with unrestricted ability to ${power} individual monsters`,
      uses: 999,
      level: 6,
      power,
      target: 'pick',
      targetFilters: {
        levels: ['minion', 'grunt', 'elite', 'boss']
      },
      icon: '🛠️',
      timestamp: Date.now()
    };
    
    // Create pick_type item (use on monster type)
    const pickTypeItem: Item = {
      id: toItemId(`debug_pick_type_${power}_${Date.now()}`),
      name: `DEBUG ${powerName} (Use on Type)`,
      description: `Debug item with unrestricted ability to ${power} all monsters of a type`,
      uses: 999,
      level: 6,
      power,
      target: 'pick_type',
      targetFilters: {
        levels: ['minion', 'grunt', 'elite', 'boss']
      },
      icon: '🛠️',
      timestamp: Date.now()
    };
    
    items.push(pickItem);
    items.push(pickTypeItem);
  });
  
  return items;
}

export async function startQuest(
    title: string,
    startGameLocation: GameLocation,
    endGameLocation: GameLocation,
    difficulty: number,
    players: number,
    minimumLocations: number = 3,
): Promise<void> {
    const questStore = useQuestStore()
    const locationStore = useLocationStore()
    const inventoryStore = useInventoryStore()
    const chatGPT = new ChatGPTAPI()

    questStore.setStatus('init');
    
    // Initialize quest details using ChatGPT
    try {
        const questData = await chatGPT.initializeQuest(
            startGameLocation.name,
            endGameLocation.name,
            minimumLocations,
            title
        )
        
        questStore.setTitle(title);
        questStore.setDescription(questData.questDescription);
        questStore.setTokenTitle(questData.tokenTitle);
        questStore.setTokenDescription(questData.tokenDescription);
    } catch (error) {
        console.error('Failed to initialize quest with ChatGPT:', error);
        // Fallback to basic initialization
        questStore.setTitle(title);
        questStore.setDescription(`Your quest is to reach ${endGameLocation.name}`);
        questStore.setTokenTitle('shard of truth');
        questStore.setTokenDescription('a magical shard that contains a piece of ancient knowledge');
    }
    
    questStore.setStartGameLocationId(startGameLocation.id);
    questStore.setEndGameLocationId(endGameLocation.id);
    questStore.setPlayerCount(players);
    questStore.setDifficulty(difficulty);
    questStore.setMinimumLocations(minimumLocations);
    questStore.setXP(0); // Initialize player XP to zero when starting a new quest
    questStore.setBooze(0); // Initialize booze consumed to zero when starting a new quest
    questStore.setSoft(0); // Initialize soft drinks consumed to zero when starting a new quest

    // Initialize locations
    locationStore.locations.forEach((location:GameLocation) => {
        initialiseGameLocation(location)
    })
    
    // Clear any existing inventory items
    while (inventoryStore.items.length > 0) {
        inventoryStore.removeItem(inventoryStore.items[0].id);
    }
    
    // Add one level 1 item per player
    for (let i = 0; i < players; i++) {
        const item = generateRandomItem(1);
        inventoryStore.addItem(item);
    }
    
    // Add debug items with unrestricted pick and pick_type for each power
    createDebugItems().forEach(item => {
        inventoryStore.addItem(item);
    });

    await scoutLocation(questStore.startGameLocation as GameLocation);
    questStore.setCurrentGameLocation(startGameLocation.id)

    questStore.setStatus('active');
}