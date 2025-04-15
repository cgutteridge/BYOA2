import type {Pub} from '@/types'
import {useQuestStore} from "@/stores/questStore.ts";
import {usePubStore} from "@/stores/pubStore.ts";
import initialiseLocation from "@/quest/initialiseLocation.ts";
import { useInventoryStore } from "@/stores/inventoryStore.ts";
import { generateRandomItem } from "@/quest/generateRandomItem.ts";
import type { Item, ItemPower } from "@/types/item.ts";

// Function to create unrestricted debug items with pick and pick_type for each power
function createDebugItems(): Item[] {
  // Define all available powers
  const powers: ItemPower[] = [
    'kill', 
    'transmute', 
    'spy',
    'shrink', 
    'split', 
    'pickpocket',
    'banish',
    'freeze'
  ];
  
  const items: Item[] = [];
  
  // Create a pick item for each power
  powers.forEach(power => {
    // Create pick item
    const pickItem: Item = {
      id: `debug_pick_${power}_${Date.now()}`,
      name: `Debug ${power.charAt(0).toUpperCase() + power.slice(1)} Picker`,
      description: `Debug item with unrestricted pick ability for ${power}`,
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
    
    // Create pick_type item
    const pickTypeItem: Item = {
      id: `debug_pick_type_${power}_${Date.now()}`,
      name: `Debug ${power.charAt(0).toUpperCase() + power.slice(1)} Type Picker`,
      description: `Debug item with unrestricted pick_type ability for ${power}`,
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
    startPub: Pub,
    endPub: Pub,
    difficulty: number,
    players: number,
): Promise<void> {
    const questStore = useQuestStore()
    const pubStore = usePubStore()
    const inventoryStore = useInventoryStore()

    questStore.setTitle(title);
    questStore.setDescription(`Your quest is to reach ${endPub.name}`);
    questStore.setStartPubId(startPub.id);
    questStore.setEndPubId(endPub.id);
    questStore.setPlayerCount(players);
    questStore.setStatus('active');
    questStore.setDifficulty(difficulty);
    questStore.setXP(0); // Initialize player XP to zero when starting a new quest

    // Initialize pubs
    pubStore.pubs.forEach((pub) => {
        initialiseLocation(pub)
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
}