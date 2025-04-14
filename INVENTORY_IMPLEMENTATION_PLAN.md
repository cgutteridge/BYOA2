# Inventory System Implementation Plan

## Completed (Stage 1):
- ✅ Set up types and data structures for enhanced items with powers
- ✅ Created inventory store with persistence
- ✅ Built inventory modal with tabs UI
- ✅ Set up basic item components (ItemCard)
- ✅ Added inspection modal for items
- ✅ Created sample items for testing
- ✅ Added inventory button to main UI
- ✅ Moved UI state to appStore for better organization

## Current Implementation Order (for maximum testability):

### Step 1: Add Item Drops to Monsters
- Modify monsters to include drops with defined probabilities
- Update LocationScreen to show items when defeating monsters
- Add ability to claim item drops in the UI
- Make drops appear in inventory

### Step 2: Implement "Kill" Powers
- Implement kill_one power functionality
- Connect to existing monster defeat mechanics
- Update inventory UI to handle using kill powers
- Test with monster encounters

### Step 3: Build Target Selection UI
- Create TargetSelectionModal component
- Support different targeting modes (pick vs random)
- Connect targeting to power usage workflow
- Apply filters based on item requirements

### Step 4: Add Inventory Integration to Location Screens
- Update location screens to use item components for prizes/drops
- Allow inspecting items before claiming them
- Complete the inventory experience across screens

## Future Enhancements:
- Additional power implementations (transmute, scout, etc.)
- Item crafting system
- Item shop/vendors
- More varied and interesting item effects 