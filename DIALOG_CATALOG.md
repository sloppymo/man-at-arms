# Man-at-Arms RPG - Complete Dialog & Interaction Catalog

## Overview
This document catalogs all dialog and interactions in the Man-at-Arms RPG game, organized by story files and encounter types.

---

## CHEVAUCHÉE CAMPAIGN (Main Story)

### 00_arrival.yarn - Beach Landing
**Location:** Norman Coast Beach
**Characters:** Sir Robert de Beaumont (Commander), Player (Man-at-Arms)
**Key Interactions:**
- Initial beach landing scene with 500 men
- Commander briefing about mission (burn, pillage, send message)
- Player choices about orders, forces, targets, supplies
- **Choices:** "What are our orders?", "How many men do we have?", "What's the target?", "What about supplies?", "When do we start raiding?"
- **Stats:** Stress (-1), Heat (+2 to +5)
- **Items:** Supplies (food, water)
- **Time:** 30-60 minutes advancement

### 01_march_events.yarn - March Events
**Location:** Inland March
**Characters:** Sir Robert, Player, Various soldiers
**Key Interactions:**
- March inland, camp setup, patrol encounters
- Soldier morale events, supply management
- Weather and terrain challenges
- **Choices:** Tactical decisions during march
- **Stats:** Morale, fatigue, supplies

### 02_raid_encounters.yarn - Raid Encounters  
**Location:** French Villages/Farms
**Characters:** French peasants, Sir Robert, Player
**Key Interactions:**
- Village raids, farm pillaging
- Moral dilemmas (spare/kill civilians)
- Combat encounters with French militia
- **Choices:** Mercy vs ruthlessness, tactical approaches
- **Stats:** Reputation, stress, loot gained

### 03_combat.yarn - Combat System
**Location:** Battlefields
**Characters:** Enemy soldiers, Sir Robert, Player
**Key Interactions:**
- Turn-based combat mechanics
- Weapon choices, tactical positioning
- Enemy AI behavior
- **Choices:** Attack types, defensive moves
- **Stats:** Health, stamina, combat skills

### 04_crisis.yarn - Crisis Events
**Location:** Various crisis locations
**Characters:** Sir Robert, Player, various NPCs
**Key Interactions:**
- Supply shortages, disease outbreaks
- Mutiny prevention, leadership challenges
- Strategic crisis management
- **Choices:** Hard leadership decisions
- **Stats:** Morale, discipline, survival

---

## OVERWORLD ENCOUNTERS (Random Events)

### tavern_encounter.yarn - Tavern Interactions
**Location:** Tavern
**Characters:** Sergeant, Barmaid, Soldiers, Player
**Key Interactions:**
- Drinking contest with superior officer
- Gambling and social dynamics
- Reputation-based reactions from other soldiers
- **Choices:** 
  - "You're on, sergeant!" (Drinking contest)
  - "Not interested, I'm on duty."
  - "How much are we betting?"
- **Flags:** sergeant_enemy, sergeant_humiliated, honorable, dishonorable, french_ally
- **Outcomes:** 
  - Win: +food, tavern_hero flag, sergeant_enemy flag
  - Refuse: sober_soldier flag, sergeant_annoyed flag
- **Stats:** Stress, reputation

### traveling_merchant_encounter.yarn - Merchant Caravan
**Location:** Roadside
**Characters:** Merchant, Player
**Key Interactions:**
- Browse merchant wares (food, wine, luxury items)
- News gathering from southern regions
- Document checking and authority challenges
- **Choices:**
  - "[Browse his wares]" → Purchase items
  - "[What news from the south?]" → Information gathering
  - "[Move along, I'm on duty.]" → Leave encounter
  - "[Your papers, merchant.]" → Authority challenge
- **Items for Sale:**
  - Salted beef (5 coins)
  - Fine wine (8 coins) 
  - Leather gloves (12 coins)
  - Silver crucifix (25 coins)
  - French perfume (30 coins)
- **Flags:** merchant_customer
- **Stats:** Gold, inventory

### lost_child_encounter.yarn - Lost Child
**Location:** Village outskirts
**Characters:** Lost Child, Player
**Key Interactions:**
- Helping lost child find parents
- Moral choice about compassion vs duty
- **Choices:** Help child, ignore child, report to authorities
- **Stats:** Morality, reputation

### deserting_soldiers_encounter.yarn - Deserting Soldiers
**Location:** Forest/Hidden camp
**Characters:** Deserting soldiers, Player
**Key Interactions:**
- Encounter with soldiers fleeing service
- Moral dilemma about duty vs compassion
- **Choices:** Turn them in, help them escape, ignore them
- **Stats:** Honor, duty, morality

### walled_town_encounter.yarn - Walled Town Gate
**Location:** Fortified town entrance
**Characters:** Town Guard, Player
**Key Interactions:**
- Gate entry negotiations with suspicious guard
- Toll payment or proof of business required
- **Choices:**
  - "[I seek entry to town.]" → Pay 10 gold toll
  - "[I have no gold.]" → Denied entry
  - "[I am on official business.]" → Requires proof
  - "[Never mind.]" → Leave peacefully
- **Outcomes:** Entry (with payment), refusal, or departure
- **Stats:** Gold (-10), access to town

### blacksmith_encounter.yarn - Blacksmith Shop
**Location:** Blacksmith forge
**Characters:** Blacksmith, Player
**Key Interactions:**
- Weapon/armor repair and upgrade
- Equipment trading
- **Choices:** Repair items, buy new equipment, sell old gear
- **Stats:** Equipment quality, gold

### church_encounter.yarn - Church
**Location:** Village church
**Characters:** Priest, Player
**Key Interactions:**
- Religious guidance and confession
- Blessings and moral support
- **Choices:** Seek blessing, confess sins, ask for guidance
- **Stats:** Morality, stress reduction

### corrupt_quartermaster_encounter.yarn - Corrupt Quartermaster
**Location:** Army supply depot
**Characters:** Quartermaster, Player
**Key Interactions:**
- Dealing with corrupt supply officer
- Bribery and supply shortages
- **Choices:** Accept corruption, report it, work around it
- **Stats:** Supplies, honor, corruption

### monastery_grounds_encounter.yarn - Monastery
**Location:** Monastery grounds
**Characters:** Monks, Player
**Key Interactions:**
- Seeking refuge or information
- Religious vs military tensions
- **Choices:** Request shelter, seek knowledge, respect rules
- **Stats:** Religion, diplomacy

### prisoner_execution_encounter.yarn - Prisoner Execution
**Location:** Military camp
**Characters:** Prisoners, Captain, Player
**Key Interactions:**
- Witnessing or participating in executions
- Moral dilemma about justice vs cruelty
- **Choices:** Stop execution, participate, watch silently
- **Stats:** Morality, trauma, reputation

### french_mother_encounter.yarn - French Mother & Child
**Location:** Village road
**Characters:** French mother, child, Player
**Key Interactions:**
- Encounter with civilian family during raid
- Protection vs duty conflict
- **Choices:** Protect family, follow orders, find compromise
- **Stats:** Honor, humanity, military discipline

### village_burning_encounter.yarn - Village Burning
**Location:** French village
**Characters:** Villagers, Sir Robert, Player
**Key Interactions:**
- Order to burn civilian village
- Major moral crisis about war crimes
- **Choices:** Carry out orders, refuse, find alternative
- **Stats:** War crimes, morality, command authority

### wounded_enemy_encounter.yarn - Wounded Enemy Soldier
**Location:** Battlefield
**Characters:** Wounded enemy, Player
**Key Interactions:**
- Mercy vs military efficiency
- Treatment of captured/enemy wounded
- **Choices:** Kill enemy, help him, leave him
- **Stats:** Compassion, military pragmatism

### deserter_encounter.yarn - Single Deserter
**Location:** Wilderness
**Characters:** Deserter, Player
**Key Interactions:**
- Encounter with soldier who fled
- Personal stories about desertion reasons
- **Choices:** Turn in, help, ignore
- **Stats:** Duty vs compassion

### castle_gate_delivery.yarn - Castle Gate Delivery
**Location:** Castle entrance
**Characters:** Gate guards, Player
**Key Interactions:**
- Official message delivery mission
- Protocol and military hierarchy
- **Choices:** Follow protocol, use influence, bypass system
- **Stats:** Rank, authority, mission success

### forest_test.yarn - Forest Test Area
**Location:** Forest
**Characters:** Forest creatures, Player
**Key Interactions:**
- Navigation challenges, survival skills
- Environmental hazards
- **Choices:** Different paths through forest
- **Stats:** Survival, navigation

### town_square_quest.yarn - Town Square Mission
**Location:** Town square
**Characters:** Town officials, Player
**Key Interactions:**
- Public mission assignment
- Civic engagement
- **Choices:** Accept quest, negotiate terms, refuse
- **Stats:** Reputation, civic standing

### town_square_complete.yarn - Town Square Completion
**Location:** Town square
**Characters:** Town officials, Player
**Key Interactions:**
- Mission completion and rewards
- Public recognition
- **Choices:** Claim rewards, share credit, decline recognition
- **Stats:** Reputation, wealth, civic status

### test_choices.yarn - Choice Testing
**Location:** Test environment
**Characters:** Test NPCs, Player
**Key Interactions:**
- Testing various choice mechanics
- Debugging different interaction types
- **Choices:** All choice types for testing
- **Stats:** Various test stat changes

---

## DIALOG SYSTEM FEATURES

### Character Portraits
- **James O'Looney:** Captain with multiple emotions (neutral, smirk, furious, disappointed, intrigued, wary, disgusted)
- **Sir David de Montfort:** Noble lord with emotions (neutral, concerned, pleased, worried, angry)
- **Merchant:** Traveling salesman with emotions (neutral, smile, worried, scared)
- **Child:** Lost youth with emotions (scared, worried, neutral, smile)
- **Soldier:** Military character with emotions (neutral, worried, scared, smile)

### Choice Types
1. **Action Choices:** Direct actions (attack, help, leave)
2. **Dialogue Choices:** Conversation responses
3. **Stat Checks:** Choices requiring skill/attribute tests
4. **Item Choices:** Inventory-based options
5. **Flag-Based Choices:** Conditional options based on previous actions

### Game Mechanics
- **Time System:** <<advanceTime X>> advances game time
- **Inventory:** <<addItem>>, <<removeItem>> for items
- **Stats:** <<changeStat stat, value>> modifies character attributes
- **Flags:** <<addFlag flag, value>> tracks story progress
- **Images:** <<showImage path>> displays scene artwork
- **Chapters:** <<markChapterStarted name>> tracks story progress

### Character Stats System
- **Core Stats:** Strength, Agility, Endurance, Charisma, Luck, Wits
- **Resources:** Wealth, Reputation, Morale, Stress
- **Progression:** Experience, Level, Level-up Points
- **Relationships:** Patron Favor, NPC opinions

---

## SUMMARY
- **Total Story Files:** 24
- **Main Campaign:** 5 files (Chevauchée story arc)
- **Overworld Encounters:** 19 files (random events)
- **Major Characters:** 5+ with portrait support
- **Choice Types:** 5+ different interaction systems
- **Stat Systems:** 11+ tracked attributes
- **Game Mechanics:** Time, inventory, flags, images, chapters

This catalog covers all current dialog and interaction content in the Man-at-Arms RPG as of the latest development state.
