import type { Item } from '../types'
import { ItemPower } from './abstractItemPower'
import { useQuestStore } from '@/stores/questStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { generateRandomItem } from '@/quest/generateRandomItem'

/**
 * RandomItem power implementation - generates a random item with power level = remaining uses
 */
export class LootboxPower extends ItemPower {
  // UI properties
  readonly displayName = "Lootbox";
  readonly icon = "🎁";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'special';

  // Item types for this power
  readonly itemArtifactNames = ["Loot Box", "Gift Box", "Magic Box", "Treasure Chest", "Mystery Bag", "Wonder Cube", "Enchanted Dice"];

  useWithoutTarget(item: Item): boolean {
    const questStore = useQuestStore();
    const inventoryStore = useInventoryStore();

    // Generate a random item with level equal to current uses
    const newItem = generateRandomItem(item.uses);
    
    // Add the item to the inventory
    inventoryStore.addItem(newItem);

    // Award XP for using the item
    questStore.logAndNotifyQuestEvent(`Used ${item.name} to generate ${newItem.name}.`, { xp: item.uses });
    
    // Reduce uses by 1
    this.reduceUses(item, 1);
    
    return true;
  }
  
  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item generates a random item with power level equal to the number of uses remaining.`;
  }
} 