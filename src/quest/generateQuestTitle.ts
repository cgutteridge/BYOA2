  import pickOne from '@/utils/pickOne';

/**
 * Generates a silly quest title for a pub crawl themed quest aimed at 20-35 year olds.
 * The title represents a legendary item that needs to be found or retrieved.
 * 
 * @returns {string} A silly quest item title
 */
export function generateQuestTitle(): string {
  const adjectives = [
    'Legendary', 'Holy', 'Sacred', 'Enchanted', 'Cursed', 'Ancient', 'Mystical',
    'Forbidden', 'Lost', 'Mythical', 'Magical', 'Fabled', 'Secret', 'Haunted',
    'Drunken', 'Wobbly', 'Beer-Soaked', 'Intoxicated', 'Tipsy', 'Boozy',
  ];

  const materials = [
    'Golden', 'Silver', 'Bronze', 'Wooden', 'Crystal', 'Iron', 'Platinum',
    'Diamond', 'Ruby', 'Emerald', 'Leather', 'Glass', 'Brass', 'Copper',
    'Foam', 'Rubber', 'Inflatable', 'Plastic', 'Glowing', 'Fizzy',
  ];

  const animals = [
    'Badger', 'Fox', 'Unicorn', 'Dragon', 'Wolf', 'Eagle', 'Griffin', 
    'Narwhal', 'Penguin', 'Platypus', 'Weasel', 'Hedgehog', 'Walrus',
    'Otter', 'Sloth', 'Llama', 'Panda', 'Capybara', 'Mongoose', 'Possum',
  ];

  const items = [
    'Chalice', 'Goblet', 'Amulet', 'Ring', 'Crown', 'Sword', 'Shield',
    'Staff', 'Wand', 'Orb', 'Scepter', 'Medallion', 'Helmet', 'Gauntlet',
    'Keg', 'Tankard', 'Pint Glass', 'Bottle Opener', 'Coaster', 'Shot Glass',
    'Beer Bong', 'Dart', 'Pool Cue', 'Bar Stool', 'Swizzle Stick', 'Flask',
  ];

  const prefixes = [
    'of Eternal Inebriation', 'of Infinite Pints', 'of Unquenchable Thirst',
    'of the Last Round', 'of Questionable Decisions', 'of Morning Regrets',
    'of Drunken Wisdom', 'of Slurred Speech', 'of Perfect Balance',
    'of Ridiculous Dancing', 'of Spectacular Hangovers', 'of Liquid Courage',
    'of Forbidden Karaoke', 'of Spontaneous Friendship', 'of Mystical Kebabs',
    'of Taxi Summoning', 'of Lost Dignity', 'of Bathroom Quests', 
    'of Forgotten Tab Payments', 'of Sudden Philosophical Insights',
  ];

  // Generate a quest item using different patterns
  const patterns = [
    // The [Adjective] [Item] of [Animal]
    () => `The ${pickOne(adjectives)} ${pickOne(items)} of ${pickOne(animals)}`,
    
    // The [Material] [Item] [Prefix]
    () => `The ${pickOne(materials)} ${pickOne(items)} ${pickOne(prefixes)}`,
    
    // The [Animal]'s [Adjective] [Item]
    () => `The ${pickOne(animals)}'s ${pickOne(adjectives)} ${pickOne(items)}`,
    
    // [Adjective] [Animal]'s [Material] [Item]
    () => `${pickOne(adjectives)} ${pickOne(animals)}'s ${pickOne(materials)} ${pickOne(items)}`,
    
    // The [Material] [Animal] [Prefix]
    () => `The ${pickOne(materials)} ${pickOne(animals)} ${pickOne(prefixes)}`,
  ];

  return pickOne(patterns)();
} 