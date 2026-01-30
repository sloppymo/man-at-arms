/**
 * Historically Grounded Equipment System for Man-at-Arms (1346-1347)
 * Based on mid-14th century Crécy-Calais era equipment
 * 
 * Design Principles:
 * - Every item has real-world referent (museum objects, period terms)
 * - Tradeoffs: coverage vs heat, fatigue, noise, fit, repair
 * - Availability constrained by year/region/social class
 * - Economy in Daily Wage Units (DWU): Archer 6d/day, Man-at-Arms 12d/day
 */

// Body Region Coverage Model
const BODY_REGIONS = {
    HEAD: {
        skull: true,
        face: true,
        throat: true
    },
    TORSO: {
        chest: true,
        ribs: true,
        back: true,
        belly: true
    },
    ARMS: {
        shoulder: true,
        upperArm: true,
        elbow: true,
        forearm: true,
        hand: true
    },
    LEGS: {
        thigh: true,
        knee: true,
        shin: true,
        foot: true
    },
    GAPS: {
        armpit: true,
        insideElbow: true,
        groin: true,
        backOfKnee: true
    }
};

// Layering System
const LAYER_TYPES = {
    TEXTILE: 'textile',      // Shirt, hoses, undertunic
    PADDING: 'padding',      // Aketon, gambeson, arming doublet
    MAIL: 'mail',           // Standard mail, haubergeon, chausses
    PLATE: 'plate',         // Pairs of plates, coat of plates, limb plates
    SURCOAT: 'surcoat'      // Social/identity layer
};

// Damage Types
const DAMAGE_TYPES = {
    CUT: 'cut',
    THRUST: 'thrust',
    BLUNT: 'blunt',
    MISSILE: 'missile'
};

// Equipment Item Specification
class ItemSpec {
    constructor(data) {
        // Historical Identity
        this.id = data.id;
        this.name = data.name;
        this.periodTerm = data.periodTerm || data.name;
        this.periodWindow = data.periodWindow; // { earliest: 1330, latest: 1400 }
        this.regions = data.regions || ['England']; // Array of region tags
        this.socialLegality = data.socialLegality; // 'peasant' | 'militia' | 'retainer' | 'man-at-arms' | 'knightly'
        this.provenance = data.provenance; // Museum reference, citation
        
        // Gameplay Identity
        this.slot = data.slot; // 'head' | 'torso' | 'arms' | 'legs' | 'weapon' | 'missile' | 'accessory'
        this.subSlot = data.subSlot; // Specific body region
        this.layer = data.layer; // LAYER_TYPES value
        
        // Protection Profile
        this.protection = {
            cut: data.protection?.cut || 0,
            thrust: data.protection?.thrust || 0,
            blunt: data.protection?.blunt || 0,
            missile: data.protection?.missile || 0
        };
        
        // Coverage (which body regions this covers)
        this.coverage = data.coverage || {};
        
        // Mobility & Fatigue
        this.mobilityCost = {
            agilityPenalty: data.mobilityCost?.agilityPenalty || 0,
            fatiguePerRound: data.mobilityCost?.fatiguePerRound || 0,
            sprintPenalty: data.mobilityCost?.sprintPenalty || 0
        };
        
        // Environmental
        this.noise = data.noise || 0; // Stealth penalty
        this.signature = data.signature || 0; // Social status modifier
        this.heat = data.heat || 0; // Heat buildup
        this.comfort = data.comfort || 0; // Rest recovery modifier
        
        // Fit & Condition
        this.fit = data.fit || 'off-the-rack'; // 'off-the-rack' | 'tailored' | 'salvage'
        this.condition = data.condition || 100; // 0-100
        this.maintenance = {
            rustRisk: data.maintenance?.rustRisk || 0,
            strapBreakChance: data.maintenance?.strapBreakChance || 0,
            paddingRot: data.maintenance?.paddingRot || 0,
            mailRingLoss: data.maintenance?.mailRingLoss || 0
        };
        
        // Economy
        this.priceDWU = data.priceDWU; // Daily Wage Units
        this.priceCategory = data.priceCategory; // 'cheap' | 'common' | 'serious' | 'elite'
        
        // Repair
        this.repair = {
            canRepair: data.repair?.canRepair || ['blacksmith', 'armorer'],
            materials: data.repair?.materials || [],
            location: data.repair?.location || 'town'
        };
        
        // Special Properties
        this.properties = data.properties || []; // ['visor-down', 'gap-target', 'armor-killer', etc.]
    }
    
    // Check if item is available in given year/region/social class
    isAvailable(year, region, socialClass) {
        if (year < this.periodWindow.earliest || year > this.periodWindow.latest) {
            return false;
        }
        if (!this.regions.includes(region)) {
            return false;
        }
        
        const socialHierarchy = ['peasant', 'militia', 'retainer', 'man-at-arms', 'knightly'];
        const itemLevel = socialHierarchy.indexOf(this.socialLegality);
        const playerLevel = socialHierarchy.indexOf(socialClass);
        
        return playerLevel >= itemLevel;
    }
    
    // Note: getEffectiveProtection is now in EquipmentManager to use equipped condition/fit
}

// Equipment Database - Canonical Items
const EQUIPMENT_DATABASE = {
    // HELMETS
    kettle_hat: new ItemSpec({
        id: 'kettle_hat',
        name: 'Kettle Hat',
        periodTerm: 'chapel-de-fer',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Common infantry helmet, widespread use',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 3, thrust: 2, blunt: 4, missile: 3 },
        coverage: { skull: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 1,
        comfort: 0,
        priceDWU: 2,
        priceCategory: 'common',
        properties: ['open-face']
    }),
    
    bascinet_open: new ItemSpec({
        id: 'bascinet_open',
        name: 'Bascinet (Open)',
        periodTerm: 'bascinet',
        periodWindow: { earliest: 1300, latest: 1420 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'retainer',
        provenance: 'Met Museum: Visored bascinet standard c. 1300–1420',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 5, missile: 4 },
        coverage: { skull: true, face: false, throat: false },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 2,
        comfort: -1,
        priceDWU: 15,
        priceCategory: 'serious',
        properties: ['open-face']
    }),
    
    bascinet_visored: new ItemSpec({
        id: 'bascinet_visored',
        name: 'Visored Bascinet with Aventail',
        periodTerm: 'bascinet à visière avec camail',
        periodWindow: { earliest: 1300, latest: 1420 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Met Museum 21986: Studs hold aventail. Royal Armouries: late-14th-c. bascinet',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 5, thrust: 4, blunt: 5, missile: 5 },
        coverage: { skull: true, face: true, throat: true },
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 2,
        signature: 2,
        heat: 4,
        comfort: -2,
        maintenance: { rustRisk: 2, strapBreakChance: 1 },
        priceDWU: 35,
        priceCategory: 'serious',
        properties: ['visor-down', 'hearing-penalty', 'vision-penalty'],
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    // TORSO ARMOR
    padded_jack: new ItemSpec({
        id: 'padded_jack',
        name: 'Padded Jack',
        periodTerm: 'gambeson',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Standard padded defense, worn alone or under armor',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.PADDING,
        protection: { cut: 2, thrust: 1, blunt: 3, missile: 1 },
        coverage: { chest: true, ribs: true, back: true, belly: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 2,
        comfort: 1,
        maintenance: { paddingRot: 1 },
        priceDWU: 3,
        priceCategory: 'common',
        repair: { canRepair: ['tailor'], materials: ['cloth', 'wool'], location: 'camp' }
    }),
    
    mail_haubergeon: new ItemSpec({
        id: 'mail_haubergeon',
        name: 'Mail Haubergeon',
        periodTerm: 'haubergeon',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Shorter than full hauberk, more practical for many soldiers',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.MAIL,
        protection: { cut: 4, thrust: 2, blunt: 2, missile: 3 },
        coverage: { chest: true, ribs: true, back: true, belly: true, shoulder: true, upperArm: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 1,
        heat: 3,
        comfort: -1,
        maintenance: { rustRisk: 3, mailRingLoss: 1 },
        priceDWU: 25,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['mail-rings', 'wire'], location: 'town' }
    }),
    
    pairs_of_plates: new ItemSpec({
        id: 'pairs_of_plates',
        name: 'Pairs of Plates',
        periodTerm: 'pairs of plates',
        periodWindow: { earliest: 1325, latest: 1399 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'man-at-arms',
        provenance: 'ScienceDirect: Plates riveted inside fabric coats, central to 14th-c. armor development',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 5, thrust: 4, blunt: 5, missile: 4 },
        coverage: { chest: true, ribs: true, back: true },
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 3, sprintPenalty: 2 },
        noise: 2,
        signature: 2,
        heat: 4,
        comfort: -2,
        maintenance: { rustRisk: 2, strapBreakChance: 2 },
        priceDWU: 50,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron-plates', 'leather', 'rivets'], location: 'town' }
    }),
    
    // WEAPONS
    arming_sword: new ItemSpec({
        id: 'arming_sword',
        name: 'Arming Sword',
        periodTerm: 'sword',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Standard sidearm, versatile',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 0,
        comfort: 0,
        maintenance: { rustRisk: 2 },
        priceDWU: 8,
        priceCategory: 'common',
        properties: ['versatile', 'gap-target'],
        repair: { canRepair: ['blacksmith'], materials: ['iron', 'whetstone'], location: 'camp' }
    }),
    
    rondel_dagger: new ItemSpec({
        id: 'rondel_dagger',
        name: 'Rondel Dagger',
        periodTerm: 'rondel dagger',
        periodWindow: { earliest: 1300, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'man-at-arms',
        provenance: 'Met Museum 32672: 33 cm long, 198 g. Gap-targeting weapon',
        slot: 'weapon',
        subSlot: 'secondary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 2,
        priceCategory: 'common',
        properties: ['gap-target', 'fast', 'concealable', 'low-damage-vs-armor'],
        repair: { canRepair: ['blacksmith'], materials: ['iron'], location: 'camp' }
    }),
    
    warhammer: new ItemSpec({
        id: 'warhammer',
        name: 'Warhammer',
        periodTerm: 'war hammer',
        periodWindow: { earliest: 1300, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'man-at-arms',
        provenance: 'Armor-killer, effective against plate',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 3, sprintPenalty: 1 },
        noise: 1,
        signature: 1,
        heat: 0,
        comfort: 0,
        priceDWU: 12,
        priceCategory: 'serious',
        properties: ['armor-killer', 'slow', 'high-fatigue'],
        repair: { canRepair: ['blacksmith'], materials: ['iron', 'wood'], location: 'town' }
    }),
    
    // MISSILE EQUIPMENT
    longbow: new ItemSpec({
        id: 'longbow',
        name: 'Longbow',
        periodTerm: 'longbow',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'Wales'],
        socialLegality: 'militia',
        provenance: 'Britannica: Very heavy draw weights, effective ranges, high training requirement',
        slot: 'missile',
        subSlot: 'bow',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 2, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        maintenance: { strapBreakChance: 1 },
        priceDWU: 3,
        priceCategory: 'common',
        properties: ['high-fatigue', 'high-lethality', 'training-required', 'string-degradation'],
        repair: { canRepair: ['fletcher'], materials: ['yew', 'sinew', 'wax'], location: 'camp' }
    }),
    
    // ACCESSORIES
    spare_strings: new ItemSpec({
        id: 'spare_strings',
        name: 'Spare Bowstrings',
        periodTerm: 'bowstrings',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Essential for archers, degrade with moisture',
        slot: 'accessory',
        subSlot: 'consumable',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.5,
        priceCategory: 'cheap',
        properties: ['consumable', 'weather-sensitive']
    }),
    
    // Additional Helmets
    bascinet_houndskull: new ItemSpec({
        id: 'bascinet_houndskull',
        name: 'Houndskull Bascinet',
        periodTerm: 'bascinet à bec de passereau',
        periodWindow: { earliest: 1350, latest: 1420 },
        regions: ['France', 'Flanders', 'Northern Italy'],
        socialLegality: 'knightly',
        provenance: 'Royal Armouries: High-end variant with extended visor',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 6, thrust: 5, blunt: 5, missile: 6 },
        coverage: { skull: true, face: true, throat: true },
        mobilityCost: { agilityPenalty: -3, fatiguePerRound: 3, sprintPenalty: 2 },
        noise: 3,
        signature: 3,
        heat: 5,
        comfort: -3,
        maintenance: { rustRisk: 2, strapBreakChance: 1 },
        priceDWU: 60,
        priceCategory: 'elite',
        properties: ['visor-down', 'hearing-penalty', 'vision-penalty', 'panic-resistance'],
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    // Additional Torso Armor
    coat_of_plates: new ItemSpec({
        id: 'coat_of_plates',
        name: 'Coat of Plates',
        periodTerm: 'coat of plates',
        periodWindow: { earliest: 1250, latest: 1350 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'man-at-arms',
        provenance: 'Met Museum 34331: Small plates riveted to fabric layers',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 5, thrust: 4, blunt: 5, missile: 4 },
        coverage: { chest: true, ribs: true, back: true },
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 3, sprintPenalty: 2 },
        noise: 2,
        signature: 2,
        heat: 4,
        comfort: -2,
        maintenance: { rustRisk: 2, strapBreakChance: 2 },
        priceDWU: 45,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron-plates', 'fabric', 'rivets'], location: 'town' }
    }),
    
    brigandine: new ItemSpec({
        id: 'brigandine',
        name: 'Brigandine',
        periodTerm: 'brigandine',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['Northern Italy', 'Flanders'],
        socialLegality: 'man-at-arms',
        provenance: 'Met Museum: Later upgrade, small plates riveted to fabric',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 6, thrust: 5, blunt: 5, missile: 5 },
        coverage: { chest: true, ribs: true, back: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 2,
        heat: 3,
        comfort: -1,
        maintenance: { rustRisk: 1, strapBreakChance: 1 },
        priceDWU: 70,
        priceCategory: 'elite',
        repair: { canRepair: ['armorer'], materials: ['iron-plates', 'fabric', 'rivets'], location: 'town' }
    }),
    
    // Limb Armor
    mail_chausses: new ItemSpec({
        id: 'mail_chausses',
        name: 'Mail Chausses',
        periodTerm: 'chausses',
        periodWindow: { earliest: 1200, latest: 1400 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'man-at-arms',
        provenance: 'Mail leg protection',
        slot: 'legs',
        subSlot: 'thigh',
        layer: LAYER_TYPES.MAIL,
        protection: { cut: 4, thrust: 2, blunt: 2, missile: 3 },
        coverage: { thigh: true, knee: true, shin: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 1,
        heat: 2,
        comfort: -1,
        maintenance: { rustRisk: 3, mailRingLoss: 1 },
        priceDWU: 20,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['mail-rings'], location: 'town' }
    }),
    
    splint_arm: new ItemSpec({
        id: 'splint_arm',
        name: 'Splint Arm Defense',
        periodTerm: 'splint',
        periodWindow: { earliest: 1320, latest: 1400 },
        regions: ['England', 'France'],
        socialLegality: 'man-at-arms',
        provenance: 'Limited plate pieces for limbs',
        slot: 'arms',
        subSlot: 'forearm',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { forearm: true, elbow: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 2,
        comfort: -1,
        maintenance: { rustRisk: 2 },
        priceDWU: 15,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    // Additional Weapons
    falchion: new ItemSpec({
        id: 'falchion',
        name: 'Falchion',
        periodTerm: 'falchion',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Rarer but flavorful single-edged sword',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 0,
        comfort: 0,
        maintenance: { rustRisk: 2 },
        priceDWU: 10,
        priceCategory: 'common',
        properties: ['versatile', 'cut-focused'],
        repair: { canRepair: ['blacksmith'], materials: ['iron'], location: 'camp' }
    }),
    
    mace: new ItemSpec({
        id: 'mace',
        name: 'Mace',
        periodTerm: 'mace',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Anti-armor weapon',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 1,
        heat: 0,
        comfort: 0,
        priceDWU: 8,
        priceCategory: 'common',
        properties: ['armor-killer', 'blunt-focused'],
        repair: { canRepair: ['blacksmith'], materials: ['iron'], location: 'camp' }
    }),
    
    poleaxe: new ItemSpec({
        id: 'poleaxe',
        name: 'Poleaxe',
        periodTerm: 'poleaxe',
        periodWindow: { earliest: 1300, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'knightly',
        provenance: 'Elite weapon, high fatigue',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 4, sprintPenalty: 2 },
        noise: 2,
        signature: 2,
        heat: 0,
        comfort: 0,
        priceDWU: 25,
        priceCategory: 'serious',
        properties: ['armor-killer', 'slow', 'high-fatigue', 'two-handed'],
        repair: { canRepair: ['blacksmith'], materials: ['iron', 'wood'], location: 'town' }
    }),
    
    // Missile Equipment
    arrows_bodkin: new ItemSpec({
        id: 'arrows_bodkin',
        name: 'Bodkin Arrows',
        periodTerm: 'arrows',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'Wales'],
        socialLegality: 'militia',
        provenance: 'Armor-piercing arrowheads',
        slot: 'missile',
        subSlot: 'ammunition',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.2,
        priceCategory: 'cheap',
        properties: ['consumable', 'armor-piercing']
    }),
    
    arrows_broadhead: new ItemSpec({
        id: 'arrows_broadhead',
        name: 'Broadhead Arrows',
        periodTerm: 'arrows',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'Wales'],
        socialLegality: 'militia',
        provenance: 'Cutting arrowheads, effective vs unarmored',
        slot: 'missile',
        subSlot: 'ammunition',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.15,
        priceCategory: 'cheap',
        properties: ['consumable', 'cut-focused']
    }),
    
    quiver: new ItemSpec({
        id: 'quiver',
        name: 'Arrow Quiver',
        periodTerm: 'quiver',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Standard arrow carrier',
        slot: 'accessory',
        subSlot: 'container',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 1,
        priceCategory: 'cheap',
        repair: { canRepair: ['leatherworker'], materials: ['leather'], location: 'camp' }
    }),
    
    // Accessories & Camp Gear
    boots: new ItemSpec({
        id: 'boots',
        name: 'Leather Boots',
        periodTerm: 'boots',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Essential footwear',
        slot: 'accessory',
        subSlot: 'footwear',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 1, missile: 0 },
        coverage: { foot: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 1,
        maintenance: { strapBreakChance: 1 },
        priceDWU: 2,
        priceCategory: 'common',
        repair: { canRepair: ['cobbler'], materials: ['leather'], location: 'camp' }
    }),
    
    cloak: new ItemSpec({
        id: 'cloak',
        name: 'Wool Cloak',
        periodTerm: 'cloak',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Cold weather protection',
        slot: 'accessory',
        subSlot: 'outerwear',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: -2, // Reduces heat loss
        comfort: 2,
        priceDWU: 1.5,
        priceCategory: 'cheap',
        repair: { canRepair: ['tailor'], materials: ['wool'], location: 'camp' }
    }),
    
    whetstone: new ItemSpec({
        id: 'whetstone',
        name: 'Whetstone',
        periodTerm: 'whetstone',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Essential maintenance tool',
        slot: 'accessory',
        subSlot: 'tool',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.3,
        priceCategory: 'cheap',
        properties: ['maintenance-tool']
    }),
    
    // BASE LAYERS & CLOTHING
    linen_shirt: new ItemSpec({
        id: 'linen_shirt',
        name: 'Linen Shirt',
        periodTerm: 'smock',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'peasant',
        provenance: 'Standard undergarment',
        slot: 'accessory',
        subSlot: 'underwear',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: { chest: true, back: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 1,
        priceDWU: 0.5,
        priceCategory: 'cheap',
        repair: { canRepair: ['tailor'], materials: ['linen'], location: 'camp' }
    }),
    
    wool_hose: new ItemSpec({
        id: 'wool_hose',
        name: 'Wool Hose',
        periodTerm: 'hose',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'peasant',
        provenance: 'Standard leg covering',
        slot: 'legs',
        subSlot: 'thigh',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: { thigh: true, shin: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 1,
        priceDWU: 0.8,
        priceCategory: 'cheap',
        repair: { canRepair: ['tailor'], materials: ['wool'], location: 'camp' }
    }),
    
    arming_doublet: new ItemSpec({
        id: 'arming_doublet',
        name: 'Arming Doublet',
        periodTerm: 'pourpoint',
        periodWindow: { earliest: 1350, latest: 1450 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'retainer',
        provenance: 'Met Museum: Fitted garment for attaching armor with points/laces',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 1, thrust: 0, blunt: 1, missile: 0 },
        coverage: { chest: true, ribs: true, back: true, belly: true, shoulder: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 1,
        comfort: 0,
        priceDWU: 4,
        priceCategory: 'common',
        properties: ['armor-attachment'],
        repair: { canRepair: ['tailor'], materials: ['fabric', 'leather'], location: 'town' }
    }),
    
    arming_points: new ItemSpec({
        id: 'arming_points',
        name: 'Arming Points',
        periodTerm: 'points',
        periodWindow: { earliest: 1350, latest: 1450 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'retainer',
        provenance: 'Met Museum: Laces for securing armor pieces to doublet',
        slot: 'accessory',
        subSlot: 'consumable',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        maintenance: { strapBreakChance: 2 },
        priceDWU: 0.2,
        priceCategory: 'cheap',
        properties: ['consumable', 'armor-attachment'],
        repair: { canRepair: ['tailor'], materials: ['cord', 'leather'], location: 'camp' }
    }),
    
    waist_belt: new ItemSpec({
        id: 'waist_belt',
        name: 'Waist Belt',
        periodTerm: 'belt',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Standard for carrying kit and sidearms',
        slot: 'accessory',
        subSlot: 'container',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        maintenance: { strapBreakChance: 1 },
        priceDWU: 1,
        priceCategory: 'cheap',
        repair: { canRepair: ['leatherworker'], materials: ['leather'], location: 'camp' }
    }),
    
    hood: new ItemSpec({
        id: 'hood',
        name: 'Hood',
        periodTerm: 'cowl',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'peasant',
        provenance: 'Standard head covering',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 0, thrust: 0, blunt: 1, missile: 0 },
        coverage: { skull: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: -1,
        comfort: 1,
        priceDWU: 0.5,
        priceCategory: 'cheap',
        repair: { canRepair: ['tailor'], materials: ['wool'], location: 'camp' }
    }),
    
    gloves: new ItemSpec({
        id: 'gloves',
        name: 'Gloves',
        periodTerm: 'gloves',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Work/seasonal hand protection',
        slot: 'arms',
        subSlot: 'hand',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: { hand: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: -1,
        comfort: 1,
        priceDWU: 0.4,
        priceCategory: 'cheap',
        repair: { canRepair: ['tailor'], materials: ['leather', 'wool'], location: 'camp' }
    }),
    
    // MAIL ARMOR
    mail_coif: new ItemSpec({
        id: 'mail_coif',
        name: 'Mail Coif',
        periodTerm: 'coif',
        periodWindow: { earliest: 1200, latest: 1400 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Mail hood, worn under or over helmet',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.MAIL,
        protection: { cut: 4, thrust: 2, blunt: 2, missile: 3 },
        coverage: { skull: true, throat: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 2,
        comfort: -1,
        maintenance: { rustRisk: 3, mailRingLoss: 1 },
        priceDWU: 8,
        priceCategory: 'common',
        repair: { canRepair: ['armorer'], materials: ['mail-rings'], location: 'town' }
    }),
    
    // PLATE ARMOR PIECES
    breastplate: new ItemSpec({
        id: 'breastplate',
        name: 'Breastplate',
        periodTerm: 'cuirass',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Front torso plate, increasingly common from mid-14th c.',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 6, thrust: 5, blunt: 5, missile: 5 },
        coverage: { chest: true, ribs: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 2,
        heat: 3,
        comfort: -1,
        maintenance: { rustRisk: 2, strapBreakChance: 1 },
        priceDWU: 45,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    backplate: new ItemSpec({
        id: 'backplate',
        name: 'Backplate',
        periodTerm: 'backplate',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Rear torso plate',
        slot: 'torso',
        subSlot: 'back',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 6, thrust: 5, blunt: 5, missile: 5 },
        coverage: { back: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 2,
        heat: 3,
        comfort: -1,
        maintenance: { rustRisk: 2, strapBreakChance: 1 },
        priceDWU: 40,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    spaulders: new ItemSpec({
        id: 'spaulders',
        name: 'Spaulders',
        periodTerm: 'spaulders',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Shoulder defenses',
        slot: 'arms',
        subSlot: 'shoulder',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { shoulder: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 1,
        comfort: -1,
        maintenance: { rustRisk: 2 },
        priceDWU: 12,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    vambraces: new ItemSpec({
        id: 'vambraces',
        name: 'Vambraces',
        periodTerm: 'vambraces',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Forearm plates',
        slot: 'arms',
        subSlot: 'forearm',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { forearm: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 1,
        comfort: 0,
        maintenance: { rustRisk: 2 },
        priceDWU: 10,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    couters: new ItemSpec({
        id: 'couters',
        name: 'Couters',
        periodTerm: 'elbow cops',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Elbow protection',
        slot: 'arms',
        subSlot: 'elbow',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { elbow: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 0,
        comfort: 0,
        maintenance: { rustRisk: 1 },
        priceDWU: 6,
        priceCategory: 'common',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    gauntlets: new ItemSpec({
        id: 'gauntlets',
        name: 'Gauntlets',
        periodTerm: 'gauntlets',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Hand armor',
        slot: 'arms',
        subSlot: 'hand',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 3, thrust: 2, blunt: 3, missile: 2 },
        coverage: { hand: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 1,
        comfort: -1,
        maintenance: { rustRisk: 2 },
        priceDWU: 15,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    cuisses: new ItemSpec({
        id: 'cuisses',
        name: 'Cuisses',
        periodTerm: 'cuisses',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Thigh plates',
        slot: 'legs',
        subSlot: 'thigh',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 5, thrust: 4, blunt: 5, missile: 4 },
        coverage: { thigh: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 2, sprintPenalty: 1 },
        noise: 1,
        signature: 1,
        heat: 2,
        comfort: -1,
        maintenance: { rustRisk: 2, strapBreakChance: 1 },
        priceDWU: 18,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    poleyns: new ItemSpec({
        id: 'poleyns',
        name: 'Poleyns',
        periodTerm: 'knee cops',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Knee protection',
        slot: 'legs',
        subSlot: 'knee',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { knee: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 0,
        comfort: 0,
        maintenance: { rustRisk: 1 },
        priceDWU: 8,
        priceCategory: 'common',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    greaves: new ItemSpec({
        id: 'greaves',
        name: 'Greaves',
        periodTerm: 'greaves',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Shin plates',
        slot: 'legs',
        subSlot: 'shin',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { shin: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 1,
        comfort: 0,
        maintenance: { rustRisk: 2 },
        priceDWU: 12,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    gorget: new ItemSpec({
        id: 'gorget',
        name: 'Gorget',
        periodTerm: 'gorget',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Throat/neck protection',
        slot: 'head',
        subSlot: 'throat',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 3, missile: 3 },
        coverage: { throat: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 1,
        comfort: -1,
        maintenance: { rustRisk: 1 },
        priceDWU: 10,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    padded_arming_cap: new ItemSpec({
        id: 'padded_arming_cap',
        name: 'Padded Arming Cap',
        periodTerm: 'coif',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Under-helmet padding',
        slot: 'head',
        subSlot: 'skull',
        layer: LAYER_TYPES.PADDING,
        protection: { cut: 1, thrust: 0, blunt: 2, missile: 0 },
        coverage: { skull: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 1,
        comfort: 1,
        maintenance: { paddingRot: 1 },
        priceDWU: 1,
        priceCategory: 'cheap',
        repair: { canRepair: ['tailor'], materials: ['cloth', 'wool'], location: 'camp' }
    }),
    
    surcoat: new ItemSpec({
        id: 'surcoat',
        name: 'Surcoat',
        periodTerm: 'tabard',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Livery/identification layer',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.SURCOAT,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: { chest: true, back: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 2,
        heat: 0,
        comfort: 0,
        priceDWU: 2,
        priceCategory: 'cheap',
        properties: ['livery', 'identification'],
        repair: { canRepair: ['tailor'], materials: ['fabric'], location: 'camp' }
    }),
    
    // WEAPONS
    spear: new ItemSpec({
        id: 'spear',
        name: 'Spear',
        periodTerm: 'spear',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Common primary weapon for foot soldiers',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 1, sprintPenalty: 1 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 2,
        priceCategory: 'cheap',
        properties: ['two-handed', 'reach'],
        repair: { canRepair: ['blacksmith'], materials: ['iron', 'wood'], location: 'camp' }
    }),
    
    buckler: new ItemSpec({
        id: 'buckler',
        name: 'Buckler',
        periodTerm: 'buckler',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'War History Online: Small shield, remains common even as big shields decline',
        slot: 'accessory',
        subSlot: 'shield',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: { hand: true, forearm: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 1.5,
        priceCategory: 'cheap',
        properties: ['parry-bonus'],
        repair: { canRepair: ['leatherworker'], materials: ['leather', 'wood'], location: 'camp' }
    }),
    
    // ARCHERY EQUIPMENT
    bracer: new ItemSpec({
        id: 'bracer',
        name: 'Bracer',
        periodTerm: 'bracer',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'Wales'],
        socialLegality: 'militia',
        provenance: 'Mary Rose: Archer\'s forearm guard',
        slot: 'arms',
        subSlot: 'forearm',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 1, thrust: 0, blunt: 1, missile: 0 },
        coverage: { forearm: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.5,
        priceCategory: 'cheap',
        properties: ['archery'],
        repair: { canRepair: ['leatherworker'], materials: ['leather'], location: 'camp' }
    }),
    
    string_wax: new ItemSpec({
        id: 'string_wax',
        name: 'String Wax',
        periodTerm: 'wax',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'String maintenance for bows',
        slot: 'accessory',
        subSlot: 'consumable',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.1,
        priceCategory: 'cheap',
        properties: ['consumable', 'maintenance-tool', 'weather-sensitive']
    }),
    
    // ADDITIONAL PLATE PIECES
    fauld: new ItemSpec({
        id: 'fauld',
        name: 'Fauld',
        periodTerm: 'fauld',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Waist lames / skirt plates',
        slot: 'torso',
        subSlot: 'belly',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { belly: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 1,
        comfort: -1,
        maintenance: { rustRisk: 2 },
        priceDWU: 15,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    tassets: new ItemSpec({
        id: 'tassets',
        name: 'Tassets',
        periodTerm: 'tassets',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Thigh-hanging plates',
        slot: 'legs',
        subSlot: 'thigh',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 3, thrust: 2, blunt: 3, missile: 2 },
        coverage: { thigh: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 1,
        comfort: 0,
        maintenance: { rustRisk: 1, strapBreakChance: 1 },
        priceDWU: 10,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron', 'leather'], location: 'town' }
    }),
    
    rerebraces: new ItemSpec({
        id: 'rerebraces',
        name: 'Rerebraces',
        periodTerm: 'rerebraces',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Upper-arm plates',
        slot: 'arms',
        subSlot: 'upperArm',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 4, thrust: 3, blunt: 4, missile: 3 },
        coverage: { upperArm: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 1,
        comfort: 0,
        maintenance: { rustRisk: 2 },
        priceDWU: 10,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    sabatons: new ItemSpec({
        id: 'sabatons',
        name: 'Sabatons',
        periodTerm: 'sabatons',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Armored shoes',
        slot: 'legs',
        subSlot: 'foot',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 3, thrust: 2, blunt: 3, missile: 2 },
        coverage: { foot: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 0, sprintPenalty: 1 },
        noise: 1,
        signature: 1,
        heat: 1,
        comfort: -1,
        maintenance: { rustRisk: 2 },
        priceDWU: 12,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    rondel_besagews: new ItemSpec({
        id: 'rondel_besagews',
        name: 'Rondel Besagews',
        periodTerm: 'besagews',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Armpit discs for gap protection',
        slot: 'arms',
        subSlot: 'shoulder',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 2, thrust: 2, blunt: 2, missile: 2 },
        coverage: { armpit: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 1,
        heat: 0,
        comfort: 0,
        maintenance: { rustRisk: 1 },
        priceDWU: 8,
        priceCategory: 'common',
        properties: ['gap-protection'],
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    plackart: new ItemSpec({
        id: 'plackart',
        name: 'Plackart',
        periodTerm: 'plackart',
        periodWindow: { earliest: 1400, latest: 1500 },
        regions: ['England', 'France', 'Flanders', 'Northern Italy'],
        socialLegality: 'man-at-arms',
        provenance: 'Reinforcing lower-breast plate',
        slot: 'torso',
        subSlot: 'chest',
        layer: LAYER_TYPES.PLATE,
        protection: { cut: 5, thrust: 4, blunt: 5, missile: 4 },
        coverage: { chest: true, belly: true },
        mobilityCost: { agilityPenalty: -1, fatiguePerRound: 1, sprintPenalty: 0 },
        noise: 1,
        signature: 1,
        heat: 2,
        comfort: -1,
        maintenance: { rustRisk: 2 },
        priceDWU: 20,
        priceCategory: 'serious',
        repair: { canRepair: ['armorer'], materials: ['iron'], location: 'town' }
    }),
    
    // ADDITIONAL WEAPONS
    ballock_dagger: new ItemSpec({
        id: 'ballock_dagger',
        name: 'Ballock Dagger',
        periodTerm: 'ballock dagger',
        periodWindow: { earliest: 1300, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Common civilian/military dagger',
        slot: 'weapon',
        subSlot: 'secondary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 1.5,
        priceCategory: 'cheap',
        properties: ['gap-target', 'fast', 'concealable'],
        repair: { canRepair: ['blacksmith'], materials: ['iron'], location: 'camp' }
    }),
    
    bill: new ItemSpec({
        id: 'bill',
        name: 'Bill',
        periodTerm: 'bill',
        periodWindow: { earliest: 1300, latest: 1500 },
        regions: ['England'],
        socialLegality: 'militia',
        provenance: 'English polearm variant',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 3, sprintPenalty: 2 },
        noise: 1,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 4,
        priceCategory: 'common',
        properties: ['two-handed', 'reach', 'versatile'],
        repair: { canRepair: ['blacksmith'], materials: ['iron', 'wood'], location: 'camp' }
    }),
    
    halberd: new ItemSpec({
        id: 'halberd',
        name: 'Halberd',
        periodTerm: 'halberd',
        periodWindow: { earliest: 1350, latest: 1500 },
        regions: ['Switzerland', 'Northern Italy', 'Flanders'],
        socialLegality: 'retainer',
        provenance: 'Polearm variant',
        slot: 'weapon',
        subSlot: 'primary',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 3, sprintPenalty: 2 },
        noise: 1,
        signature: 1,
        heat: 0,
        comfort: 0,
        priceDWU: 8,
        priceCategory: 'common',
        properties: ['two-handed', 'reach', 'armor-killer'],
        repair: { canRepair: ['blacksmith'], materials: ['iron', 'wood'], location: 'town' }
    }),
    
    pavise: new ItemSpec({
        id: 'pavise',
        name: 'Pavise',
        periodTerm: 'pavise',
        periodWindow: { earliest: 1300, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'militia',
        provenance: 'Large shield for crossbow/archer cover',
        slot: 'accessory',
        subSlot: 'shield',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: { chest: true, ribs: true, back: true },
        mobilityCost: { agilityPenalty: -2, fatiguePerRound: 2, sprintPenalty: 2 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 5,
        priceCategory: 'common',
        properties: ['cover-bonus', 'two-handed', 'stationary'],
        repair: { canRepair: ['carpenter'], materials: ['wood', 'leather'], location: 'camp' }
    }),
    
    // ADDITIONAL ARCHERY
    arrow_bag: new ItemSpec({
        id: 'arrow_bag',
        name: 'Arrow Bag',
        periodTerm: 'arrow bag',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'Wales'],
        socialLegality: 'militia',
        provenance: 'Alternative to quiver for arrow storage',
        slot: 'accessory',
        subSlot: 'container',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 0.8,
        priceCategory: 'cheap',
        repair: { canRepair: ['leatherworker'], materials: ['leather'], location: 'camp' }
    }),
    
    arrow_sheaf: new ItemSpec({
        id: 'arrow_sheaf',
        name: 'Sheaf of Arrows',
        periodTerm: 'sheaf',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'Wales'],
        socialLegality: 'militia',
        provenance: 'Warbow Wales: Bundled arrows for issue/storage',
        slot: 'missile',
        subSlot: 'ammunition',
        layer: null,
        protection: { cut: 0, thrust: 0, blunt: 0, missile: 0 },
        coverage: {},
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 0,
        priceDWU: 1.5,
        priceCategory: 'cheap',
        properties: ['consumable', 'bulk-ammunition']
    }),
    
    // ADDITIONAL CLOTHING
    turnshoes: new ItemSpec({
        id: 'turnshoes',
        name: 'Turnshoes',
        periodTerm: 'turnshoes',
        periodWindow: { earliest: 1200, latest: 1500 },
        regions: ['England', 'France', 'Flanders'],
        socialLegality: 'peasant',
        provenance: 'Leather shoes with sole turned inward',
        slot: 'legs',
        subSlot: 'foot',
        layer: LAYER_TYPES.TEXTILE,
        protection: { cut: 0, thrust: 0, blunt: 1, missile: 0 },
        coverage: { foot: true },
        mobilityCost: { agilityPenalty: 0, fatiguePerRound: 0, sprintPenalty: 0 },
        noise: 0,
        signature: 0,
        heat: 0,
        comfort: 1,
        maintenance: { strapBreakChance: 1 },
        priceDWU: 1.5,
        priceCategory: 'cheap',
        repair: { canRepair: ['cobbler'], materials: ['leather'], location: 'camp' }
    })
};

// Equipment Manager Class - Fixed for persistence and layered inventory
class EquipmentManager {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Initialize equipment structure if missing
        if (!gameState.equipment) {
            gameState.equipment = {
                head: {},
                torso: {},
                arms: {},
                legs: {},
                weapon: {},
                missile: {},
                accessory: {},
                bag: [] // Unequipped items
            };
        }
        
        // Migrate old single-slot format to layered format
        this.migrateOldFormat();
        
        // Validate coverage keys
        this.validateCoverageKeys();
    }
    
    // Migrate old equipment format to layered structure
    migrateOldFormat() {
        const old = this.gameState.equipment;
        
        // If it's already layered (has head/torso/etc objects), we're good
        if (old.head && typeof old.head === 'object' && !old.head.id) {
            return; // Already layered
        }
        
        // Migrate old format
        const migrated = {
            head: {},
            torso: {},
            arms: {},
            legs: {},
            weapon: {},
            missile: {},
            accessory: {},
            bag: old.bag || []
        };
        
        // Convert old single-item slots
        if (old.head && old.head.id) {
            const layer = EQUIPMENT_DATABASE[old.head.id]?.layer || LAYER_TYPES.PLATE;
            migrated.head[layer] = { id: old.head.id, condition: old.head.condition || 100, fit: old.head.fit || 'off-the-rack' };
        }
        if (old.torso && old.torso.id) {
            const layer = EQUIPMENT_DATABASE[old.torso.id]?.layer || LAYER_TYPES.PLATE;
            migrated.torso[layer] = { id: old.torso.id, condition: old.torso.condition || 100, fit: old.torso.fit || 'off-the-rack' };
        }
        if (old.weapon && old.weapon.id) {
            migrated.weapon.primary = { id: old.weapon.id, condition: old.weapon.condition || 100, fit: old.weapon.fit || 'off-the-rack' };
        }
        
        this.gameState.equipment = migrated;
    }
    
    // Validate coverage keys against canonical set
    validateCoverageKeys() {
        const canonicalKeys = new Set();
        Object.values(BODY_REGIONS).forEach(region => {
            Object.keys(region).forEach(key => canonicalKeys.add(key));
        });
        
        // Validate all items in database
        Object.values(EQUIPMENT_DATABASE).forEach(item => {
            Object.keys(item.coverage || {}).forEach(key => {
                if (!canonicalKeys.has(key)) {
                    console.warn(`Item ${item.id} has unknown coverage key: ${key}`);
                }
            });
        });
    }
    
    // Get all available items for current year/region/social class
    getAvailableItems(year, region, socialClass) {
        return Object.values(EQUIPMENT_DATABASE).filter(item => 
            item.isAvailable(year, region, socialClass)
        );
    }
    
    // Equip an item to a specific slot and layer
    equipItem(itemId, slot, layer = null) {
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return false;
        
        // Determine layer if not provided
        if (!layer) {
            layer = item.layer || (slot === 'weapon' ? 'primary' : LAYER_TYPES.PLATE);
        }
        
        // Check availability - use region, not location
        const region = this.gameState.region || this.normalizeRegion(this.gameState.location) || 'England';
        if (!item.isAvailable(
            this.gameState.year || 1346,
            region,
            this.gameState.rank || 'retainer'
        )) {
            return false;
        }
        
        // Initialize slot if needed
        if (!this.gameState.equipment[slot]) {
            this.gameState.equipment[slot] = {};
        }
        
        // Store only primitives (id, condition, fit) - NOT the full item object
        this.gameState.equipment[slot][layer] = {
            id: itemId,
            condition: 100, // Default condition
            fit: 'off-the-rack' // Default fit
        };
        
        return true;
    }
    
    // Normalize location to region
    normalizeRegion(location) {
        if (!location) return 'England';
        const loc = location.toLowerCase();
        if (loc.includes('england') || loc.includes('portsmouth') || loc.includes('london')) return 'England';
        if (loc.includes('france') || loc.includes('normandy') || loc.includes('caen') || loc.includes('calais')) return 'France';
        if (loc.includes('flanders')) return 'Flanders';
        if (loc.includes('italy') || loc.includes('milan')) return 'Northern Italy';
        return 'England'; // Default
    }
    
    // Calculate effective protection (using equipped condition/fit, not template)
    getEffectiveProtection(item, damageType, equippedCondition, equippedFit) {
        const base = item.protection[damageType] || 0;
        const conditionMod = equippedCondition / 100;
        const fitMod = equippedFit === 'tailored' ? 1.0 : equippedFit === 'off-the-rack' ? 0.9 : 0.7;
        return Math.floor(base * conditionMod * fitMod);
    }
    
    // Calculate total protection for a body region (with layering)
    getProtectionForRegion(region, damageType) {
        let totalProtection = 0;
        
        // Check all slots and layers
        const slots = ['head', 'torso', 'arms', 'legs'];
        for (const slot of slots) {
            const slotData = this.gameState.equipment[slot] || {};
            
            // Check all layers in this slot (padding, mail, plate, surcoat)
            for (const layer in slotData) {
                const equipped = slotData[layer];
                if (!equipped || !equipped.id) continue;
                
                const item = EQUIPMENT_DATABASE[equipped.id];
                if (!item) continue;
                
                // Check if this item covers the region
                if (item.coverage && item.coverage[region]) {
                    totalProtection += this.getEffectiveProtection(
                        item,
                        damageType,
                        equipped.condition || 100,
                        equipped.fit || 'off-the-rack'
                    );
                }
            }
        }
        
        return totalProtection;
    }
    
    // Calculate gap exposure (missing layers, poor fit, visor state)
    getGapExposure() {
        let exposure = 0;
        
        // Check torso layers
        const torso = this.gameState.equipment.torso || {};
        if (!torso[LAYER_TYPES.PADDING]) exposure += 2; // Missing padding
        if (!torso[LAYER_TYPES.MAIL]) exposure += 3; // Missing mail
        if (!torso[LAYER_TYPES.PLATE]) exposure += 2; // Missing plate
        
        // Check fit quality
        for (const slot of ['head', 'torso', 'arms', 'legs']) {
            const slotData = this.gameState.equipment[slot] || {};
            for (const layer in slotData) {
                const equipped = slotData[layer];
                if (equipped && equipped.fit === 'salvage') {
                    exposure += 1;
                }
            }
        }
        
        // Check visor state (if visored helm)
        const head = this.gameState.equipment.head || {};
        const plateHelm = head[LAYER_TYPES.PLATE];
        if (plateHelm) {
            const helmItem = EQUIPMENT_DATABASE[plateHelm.id];
            if (helmItem && helmItem.properties.includes('visor-down')) {
                // Visor down reduces gap exposure
                exposure = Math.max(0, exposure - 1);
            } else if (helmItem && helmItem.properties.includes('open-face')) {
                // Open face increases exposure
                exposure += 2;
            }
        }
        
        return Math.min(10, exposure); // Cap at 10
    }
    
    // Get comprehensive kit profile for combat
    getKitProfile() {
        const protection = {};
        const regions = ['skull', 'face', 'throat', 'chest', 'ribs', 'back', 'belly', 
                        'shoulder', 'upperArm', 'elbow', 'forearm', 'hand',
                        'thigh', 'knee', 'shin', 'foot'];
        const damageTypes = [DAMAGE_TYPES.CUT, DAMAGE_TYPES.THRUST, DAMAGE_TYPES.BLUNT, DAMAGE_TYPES.MISSILE];
        
        // Initialize protection matrix
        for (const region of regions) {
            protection[region] = {};
            for (const damageType of damageTypes) {
                protection[region][damageType] = this.getProtectionForRegion(region, damageType);
            }
        }
        
        const mobility = this.getMobilityPenalties();
        const environment = this.getEnvironmentalModifiers();
        const gapExposure = this.getGapExposure();
        
        return {
            protection,
            mobility,
            environment,
            gapExposure,
            fatiguePerRound: mobility.fatiguePerRound,
            heatPenalty: environment.heat,
            recoveryPenalty: -environment.comfort, // Negative comfort = recovery penalty
            stealthPenalty: environment.noise
        };
    }
    
    // Calculate total mobility penalties (from all layers)
    getMobilityPenalties() {
        let totalPenalties = {
            agilityPenalty: 0,
            fatiguePerRound: 0,
            sprintPenalty: 0,
            sprintFatigue: 0,
            stealthPenalty: 0
        };
        
        // Check all slots and layers
        for (const slot of ['head', 'torso', 'arms', 'legs']) {
            const slotData = this.gameState.equipment[slot] || {};
            for (const layer in slotData) {
                const equipped = slotData[layer];
                if (!equipped || !equipped.id) continue;
                
                const item = EQUIPMENT_DATABASE[equipped.id];
                if (!item) continue;
                
                totalPenalties.agilityPenalty += item.mobilityCost.agilityPenalty || 0;
                totalPenalties.fatiguePerRound += item.mobilityCost.fatiguePerRound || 0;
                totalPenalties.sprintPenalty += item.mobilityCost.sprintPenalty || 0;
                totalPenalties.stealthPenalty += item.noise || 0;
                
                // Sprint fatigue spike
                if (item.mobilityCost.sprintPenalty > 0) {
                    totalPenalties.sprintFatigue += item.mobilityCost.sprintPenalty * 2;
                }
            }
        }
        
        return totalPenalties;
    }
    
    // Calculate total heat/comfort modifiers
    getEnvironmentalModifiers() {
        let modifiers = {
            heat: 0,
            comfort: 0,
            noise: 0
        };
        
        for (const slot of ['head', 'torso', 'arms', 'legs']) {
            const slotData = this.gameState.equipment[slot] || {};
            for (const layer in slotData) {
                const equipped = slotData[layer];
                if (!equipped || !equipped.id) continue;
                
                const item = EQUIPMENT_DATABASE[equipped.id];
                if (!item) continue;
                
                modifiers.heat += item.heat || 0;
                modifiers.comfort += item.comfort || 0;
                modifiers.noise += item.noise || 0;
            }
        }
        
        return modifiers;
    }
    
    // Get stat modifiers from equipment
    getStatModifiers() {
        const kit = this.getKitProfile();
        return {
            agility: kit.mobility.agilityPenalty,
            endurance: Math.floor(kit.protection.chest?.cut / 2) || 0, // Protection as endurance bonus
            stealth: -kit.stealthPenalty,
            morale: kit.environment.comfort > 0 ? 1 : 0 // Comfortable gear = morale boost
        };
    }
    
    // Degrade equipment based on structured conditions
    degradeEquipment(conditions) {
        // conditions: { wet, mud, saltAir, siege, rain }
        
        for (const slot of ['head', 'torso', 'arms', 'legs', 'weapon', 'missile']) {
            const slotData = this.gameState.equipment[slot] || {};
            
            for (const layer in slotData) {
                const equipped = slotData[layer];
                if (!equipped || !equipped.id) continue;
                
                const item = EQUIPMENT_DATABASE[equipped.id];
                if (!item) continue;
                
                let degradation = 0;
                
                // Rust risk (rain, mud, salt air)
                if ((conditions.rain || conditions.mud || conditions.saltAir) && item.maintenance.rustRisk > 0) {
                    degradation += item.maintenance.rustRisk;
                }
                
                // Strap break chance (increased in mud/siege)
                const strapChance = item.maintenance.strapBreakChance || 0;
                if (strapChance > 0) {
                    const breakRisk = conditions.mud ? strapChance * 2 : conditions.siege ? strapChance * 1.5 : strapChance;
                    if (Math.random() < breakRisk / 100) {
                        degradation += 5;
                    }
                }
                
                // Mail ring loss (gradual, accelerated in wet/salt)
                if (item.layer === LAYER_TYPES.MAIL && item.maintenance.mailRingLoss > 0) {
                    const lossRate = (conditions.wet || conditions.saltAir) ? item.maintenance.mailRingLoss : item.maintenance.mailRingLoss / 2;
                    degradation += lossRate / 10;
                }
                
                // Padding rot (wet conditions, siege)
                if (item.layer === LAYER_TYPES.PADDING && (conditions.wet || conditions.siege)) {
                    if (item.maintenance.paddingRot > 0) {
                        degradation += item.maintenance.paddingRot;
                    }
                }
                
                // Leather degradation (wet, salt air) - aventail attachment, straps
                if (item.properties && (item.properties.includes('visor-down') || item.maintenance.strapBreakChance > 0)) {
                    if (conditions.wet || conditions.saltAir) {
                        degradation += 1; // Leather band/straps degrade
                    }
                }
                
                // Apply degradation
                if (degradation > 0) {
                    equipped.condition = Math.max(0, Math.floor(equipped.condition - degradation));
                }
            }
        }
    }
    
    // Get weapon stats for combat
    getWeaponStats() {
        const weaponSlot = this.gameState.equipment.weapon || {};
        const primary = weaponSlot.primary;
        
        if (!primary || !primary.id) {
            return { quality: 0, type: 'none', properties: [] };
        }
        
        const item = EQUIPMENT_DATABASE[primary.id];
        if (!item) {
            return { quality: 0, type: 'none', properties: [] };
        }
        
        return {
            quality: Math.floor((primary.condition || 100) / 20), // Condition affects quality
            type: primary.id,
            properties: item.properties || []
        };
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EQUIPMENT_DATABASE,
        EquipmentManager,
        BODY_REGIONS,
        LAYER_TYPES,
        DAMAGE_TYPES
    };
}
