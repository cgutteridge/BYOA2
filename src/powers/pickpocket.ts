import { ItemPower } from './abstractItemPower'
import { Item, Monster } from "@/types";
import { useQuestStore } from "@/stores/questStore.ts";
import { useInventoryStore } from "@/stores/inventoryStore.ts";
import { useAppStore } from "@/stores/appStore.ts";

/**
 * Pickpocket power implementation
 */
export class PickpocketPower extends ItemPower {
  // UI properties
  readonly displayName = "Pickpocket";
  readonly icon = "🧤";
  readonly glowColor = "rgba(0, 100, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = false; // Can't target monster types
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'grunt'; // Max level this works on

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Gloves", "Lockpick", "Hook", "Claw", "Hand", "Grasp", "Grip", "Thief's Tool"];

  /**
   * Override canTargetMonster to only allow targeting monsters with items
   */
  canTargetMonster(item: Item, monster: Monster): boolean {
    // First apply the base class logic
    const canTarget = super.canTargetMonster(item, monster);
    
    // Only allow targeting monsters that have items
    return canTarget && monster.item !== undefined;
  }

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();
    const inventoryStore = useInventoryStore();
    const appStore = useAppStore();

    // Check if monster has an item to steal
    if (!monster.item) {
      appStore.addNotification(`${monster.name} has no items to steal.`);
      return false;
    }

    // Get the item from the monster
    const stolenItem = monster.item;
    
    // Add the stolen item to inventory
    inventoryStore.addItem(stolenItem);
    
    // Remove the item from the monster
    monster.item = undefined;

    // Log the theft
    questStore.logAndNotifyQuestEvent(
      `Stole ${stolenItem.name} from ${monster.name} using ${item.name}`,
      { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item lets you steal an item from ${this.getTargetDescription(item)}.`;
  }
} 