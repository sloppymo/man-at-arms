(function() {
    'use strict';
    
    // Tempo Strike Profiles - defines behavior for different action types
    const TempoStrikeProfiles = {
      press: {
        id: 'press',
        name: 'Press Attack',
        statKey: 'strength',
        baseWindows: { perfect: 80, good: 200 }, // ms
        multiBeat: { maxBeats: 1, enabled: false },
        exertionCost: { perfect: 1, good: 0, miss: 0 },
        effects: {
          perfect_early: ['damage_boost', 'momentum'],
          perfect_late: ['damage_boost', 'off_balance'],
          good_early: ['minor_damage'],
          good_late: ['minor_damage', 'stagger'],
          miss: ['fatigue']
        }
      },
      hold: {
        id: 'hold', 
        name: 'Defensive Hold',
        statKey: 'wits',
        baseWindows: { perfect: 100, good: 250 },
        multiBeat: { maxBeats: 2, enabled: true },
        exertionCost: { perfect: 1, good: 0, miss: 0 },
        effects: {
          perfect_early: ['counter_ready', 'positioning'],
          perfect_late: ['counter_ready', 'delayed'],
          good_early: ['minor_counter'],
          good_late: ['minor_counter', 'slow_recovery'],
          miss: ['exposed', 'fatigue']
        }
      },
      drive: {
        id: 'drive',
        name: 'Drive Forward', 
        statKey: 'charisma',
        baseWindows: { perfect: 90, good: 220 },
        multiBeat: { maxBeats: 3, enabled: true },
        exertionCost: { perfect: 2, good: 1, miss: 0 },
        effects: {
          perfect_early: ['morale_boost', 'initiative'],
          perfect_late: ['morale_boost', 'reckless'],
          good_early: ['minor_morale'],
          good_late: ['minor_morale', 'tiring'],
          miss: ['demoralized', 'exhausted']
        }
      }
    };
    
    // Risk Tiers Configuration
    const RiskTiers = {
      safe: {
        id: 'safe',
        name: 'Safe',
        windowMultiplier: 1.5,
        rewardTable: { MISS: 0, GOOD: 1, PERFECT: 2 },
        exertionMultiplier: 0.5,
        missPenalty: { exertionDelta: 0, effectTags: [] }
      },
      greedy: {
        id: 'greedy', 
        name: 'Greedy',
        windowMultiplier: 0.7,
        rewardTable: { MISS: 0, GOOD: 2, PERFECT: 4 },
        exertionMultiplier: 1.2,
        missPenalty: { exertionDelta: 1, effectTags: ['fatigue'] }
      }
    };
    
    // Weapon and Stat Modifiers
    const WeaponModifiers = {
      spear: {
        timingAdjustment: 50, // ms easier (reach advantage)
        effectMapping: {
          perfect_early: ['reach_advantage', 'thrust'],
          perfect_late: ['reach_advantage', 'wide_thrust']
        }
      },
      sword: {
        timingAdjustment: 0, // neutral
        effectMapping: {
          perfect_early: ['precise_cut'],
          perfect_late: ['heavy_cut']
        }
      }
    };
    
    const StatScaling = {
      agility: {
        windowMultiplier: 1.1, // 10% larger windows per point
        maxMultiplier: 1.5     // Cap at 50% larger windows
      },
      wits: {
        windowMultiplier: 1.05, // 5% larger windows per point  
        maxMultiplier: 1.3      // Cap at 30% larger windows
      }
    };
    
    // Helper function to clone profile template
    function cloneProfile(profileId) {
      const profile = TempoStrikeProfiles[profileId];
      if (!profile) return null;
      return JSON.parse(JSON.stringify(profile));
    }
    
    // Helper function to get weapon modifier
    function getWeaponModifier(weaponId) {
      if (!weaponId || !window.EQUIPMENT_DATABASE) return null;
      const weapon = window.EQUIPMENT_DATABASE[weaponId];
      if (!weapon) return null;
      
      // Map weapon types to modifiers
      if (weapon.id === 'spear' || weapon.name?.toLowerCase().includes('spear')) {
        return WeaponModifiers.spear;
      } else if (weapon.id === 'sword' || weapon.name?.toLowerCase().includes('sword')) {
        return WeaponModifiers.sword;
      }
      return null;
    }
    
    // Helper function to apply stat scaling
    function applyStatScaling(windows, stats) {
      let scaledWindows = { ...windows };
      
      Object.keys(StatScaling).forEach(stat => {
        const statValue = stats[stat] || 0;
        if (statValue > 0) {
          const scaling = StatScaling[stat];
          const multiplier = Math.min(
            scaling.windowMultiplier * statValue,
            scaling.maxMultiplier
          );
          
          scaledWindows.perfect = Math.floor(scaledWindows.perfect * multiplier);
          scaledWindows.good = Math.floor(scaledWindows.good * multiplier);
        }
      });
      
      return scaledWindows;
    }
    
    // Helper function to build effect tags with merge order
    function buildEffectTags(grade, direction, profileId, tierId, weaponId) {
      const profile = TempoStrikeProfiles[profileId];
      const tier = RiskTiers[tierId];
      const weaponMod = getWeaponModifier(weaponId);
      
      let tags = [];
      
      // 1. Base Profile Effects
      const effectKey = `${grade.toLowerCase()}_${direction}`;
      if (profile.effects[effectKey]) {
        tags.push(...profile.effects[effectKey]);
      }
      
      // 2. Tier Effects (if any)
      if (grade === 'MISS' && tier.missPenalty.effectTags) {
        tags.push(...tier.missPenalty.effectTags);
      }
      
      // 3. Weapon Overrides (additive)
      if (weaponMod && weaponMod.effectMapping && weaponMod.effectMapping[effectKey]) {
        tags.push(...weaponMod.effectMapping[effectKey]);
      }
      
      return tags;
    }
    
    // Helper function to calculate exertion delta
    function calculateExertionDelta(grade, profileId, tierId) {
      const profile = TempoStrikeProfiles[profileId];
      const tier = RiskTiers[tierId];
      
      let baseExertion = profile.exertionCost[grade.toLowerCase()] || 0;
      let exertionDelta = Math.floor(baseExertion * tier.exertionMultiplier);
      
      // Add miss penalty if applicable
      if (grade === 'MISS') {
        exertionDelta += tier.missPenalty.exertionDelta || 0;
      }
      
      return Math.max(0, exertionDelta);
    }
    
    // Telemetry callback interface
    let telemetryCallback = null;
    
    // Set telemetry callback for performance monitoring
    function setTelemetryCallback(callback) {
      telemetryCallback = callback;
    }
    
    // Send telemetry data
    function sendTelemetry(data) {
      if (telemetryCallback) {
        telemetryCallback(data);
      }
    }
    
    // Make available globally
    window.TempoStrikeProfiles = TempoStrikeProfiles;
    window.RiskTiers = RiskTiers;
    window.WeaponModifiers = WeaponModifiers;
    window.StatScaling = StatScaling;
    window.cloneTempoProfile = cloneProfile;
    window.getTempoWeaponModifier = getWeaponModifier;
    window.applyTempoStatScaling = applyStatScaling;
    window.buildTempoEffectTags = buildEffectTags;
    window.calculateTempoExertion = calculateExertionDelta;
    window.setTempoTelemetryCallback = setTelemetryCallback;
    window.sendTempoTelemetry = sendTelemetry;
    
  })();
