// ============================================
// Man-at-Arms Core Constants
// Historical chapters and game constants (ES Module)
// ============================================

// Historical chapters that structure the game's narrative arc
export const CHAPTERS = {
  chevauchée: {
    id: "chevauchée",
    name: "The Chevauchée",
    year: 1346,
    description: "Scorched earth raids through Normandy to provoke French knights.",
    startYear: 1346,
    endYear: 1346,
    victoryCondition: "Survive the raids and reach Calais",
    deathRate: 0.70, // 70% death rate during brutal raids
    specialMechanics: ["raiding", "scorched_earth", "high_mortality"]
  },
  calais: {
    id: "calais",
    name: "Siege of Calais",
    year: 1346,
    description: "The subsequent grinding siege after Crécy.",
    startYear: 1346,
    endYear: 1347,
    victoryCondition: "Survive the siege until Calais falls",
    deathRate: 0.75, // 75% death rate during siege (disease, starvation, combat)
    specialMechanics: ["siege", "starvation", "disease", "boredom"]
  },
  plague: {
    id: "plague",
    name: "The Black Death",
    year: 1348,
    description: "The pause/plague phase.",
    startYear: 1348,
    endYear: 1353,
    victoryCondition: "Survive the plague years",
    deathRate: 0.80, // 80% death rate during plague (highest!)
    specialMechanics: ["plague", "arbitrary_death", "isolation", "despair"]
  },
  poitiers: {
    id: "poitiers",
    name: "Poitiers/Tours",
    year: 1356,
    description: "The Black Prince's chevauchée culminating in capture of King John II.",
    startYear: 1356,
    endYear: 1356,
    victoryCondition: "Survive the campaign and witness the capture of the French king",
    deathRate: 0.65, // 65% death rate (slightly better, but still brutal)
    specialMechanics: ["chevauchée", "major_battle", "glory"]
  }
};

// Kit tier mapping: plan names -> actual tier names
export const KIT_TIER_MAP = {
  "poor": "Ragged",
  "standard": "Standard",
  "well_equipped": "Good",
  "veteran": "Fine",
  "raider": "Superior"
};

// Patron definitions with stat modifiers
export const PATRONS = {
  james_olooney: {
    id: "james_olooney",
    name: 'Sir James "The Reaver" de Looney',
    type: "Free Company",
    blurb: "Wildcard captain known for murder and pillage. Profitable. Unstable.",
    statMods: { strength: 1, agility: 1, morale: -1, wealth: 2 },
    kitTier: "raider",
    eventPath: "patron_path_olooney"
  },
  lord_david: {
    id: "lord_david",
    name: "Sir David de Montfort",
    type: "Noble Household",
    blurb: "Timid but fair third son; values his men's lives. Safer, slower.",
    statMods: { charisma: 1, morale: 1, wits: 1, wealth: -2 },
    kitTier: "standard",
    eventPath: "patron_path_david"
  },
  duke_caley: {
    id: "duke_caley",
    name: "Baron Caley of Tournai",
    type: "Noble Household",
    blurb: "Indifferent to your life; higher glory and plunder if you survive.",
    statMods: { wealth: 3, reputation: 1, morale: -1, stress: 1 },
    kitTier: "well_equipped",
    eventPath: "patron_path_caley"
  },
  count_charles: {
    id: "count_charles",
    name: 'Count Charles "The Grim" of Suffolk',
    type: "Noble Household",
    blurb: "Grizzled leader, drinking hard; veterans, volatility, hard lessons.",
    statMods: { strength: 1, endurance: 1, morale: -1, stress: 1, wits: -1 },
    kitTier: "veteran",
    eventPath: "patron_path_charles"
  },
  ashkhan: {
    id: "ashkhan",
    name: "Ashkhan of the Mamluk Guard",
    type: "Mercenary Company",
    blurb: "Respected mercenary from the Levant with tactical expertise. Professional and disciplined.",
    statMods: { agility: 1, wits: 1, reputation: 1 },
    kitTier: "veteran",
    eventPath: "patron_path_ashkhan"
  }
};

// Stat limits
export const statLimits = {
  strength: { min: 0, max: 10 },
  agility: { min: 0, max: 10 },
  endurance: { min: 0, max: 10 },
  charisma: { min: 0, max: 10 },
  luck: { min: 0, max: 10 },
  wits: { min: 0, max: 10 },
  morale: { min: 0, max: 10 },
  stress: { min: 0, max: 10 },
  initiative: { min: 5, max: 10 },
  wealth: { min: 0, max: 24000 }, // Max 100 pounds (24000 pence)
  reputation: { min: -20, max: 50 },
  experience: { min: 0, max: 1000 },
  patronFavor: { min: 0, max: 20 }
};

// ============================================
// Backward Compatibility
// Attach to window for existing code that expects globals
// ============================================
if (typeof window !== 'undefined') {
  window.CHAPTERS = CHAPTERS;
  window.PATRONS = PATRONS;
  window.KIT_TIER_MAP = KIT_TIER_MAP;
  window.statLimits = statLimits;
}
