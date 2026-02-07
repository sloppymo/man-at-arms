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
    
    // Tempo Strike Minigame Implementation
    function startTempoStrike(options) {
        console.log('startTempoStrike called with options:', options);
        return new Promise((resolve) => {
            const overlay = document.getElementById('minigame-overlay');
            const content = document.getElementById('minigame-content');
            const title = document.getElementById('minigame-title');
            const subtitle = document.getElementById('minigame-subtitle');
            const display = document.getElementById('minigame-display');
            const instructions = document.getElementById('minigame-instructions');

            // Set content
            title.textContent = options.title || 'Tempo Strike';
            subtitle.textContent = options.subtitle || 'Time your strike!';
            instructions.textContent = 'Choose your risk level and tap Stop when the marker is in the orange zone.';

            // Style the overlay as a modal
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 99999;';

            // Style the content
            content.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1a1a1a; border: 2px solid #d4af37; border-radius: 10px; padding: 20px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; color: #d4af37;';

            // Clear previous content
            display.innerHTML = '';

            // Create tier selection
            const tierSelect = document.createElement('div');
            tierSelect.innerHTML = '<div style="margin: 20px 0; text-align: center;"><button id="safe-tier-btn" style="padding: 10px 20px; margin: 0 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Safe (Easier)</button><button id="greedy-tier-btn" style="padding: 10px 20px; margin: 0 10px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer;">Greedy (Harder)</button></div>';
            display.appendChild(tierSelect);

            // Show overlay
            overlay.style.display = 'flex';
            console.log('minigame overlay shown');

            let selectedTier = 'safe';
            let animationId = null;
            let markerPosition = 0;
            let direction = 1; // 1 = right, -1 = left
            let isRunning = false;

            // Tier selection handlers
            const safeBtn = document.getElementById('safe-tier-btn');
            const greedyBtn = document.getElementById('greedy-tier-btn');
            
            safeBtn.addEventListener('click', () => {
                console.log('safe tier button clicked');
                selectedTier = 'safe';
                startMinigame();
            });

            greedyBtn.addEventListener('click', () => {
                console.log('greedy tier button clicked');
                selectedTier = 'greedy';
                startMinigame();
            });

            function startMinigame() {
                // Clear tier selection
                display.innerHTML = '';

                // Create progress bar
                const progressContainer = document.createElement('div');
                progressContainer.style.cssText = 'width: 400px; height: 40px; background: #333; border: 2px solid #666; border-radius: 5px; margin: 20px auto; position: relative; overflow: hidden;';

                const progressBar = document.createElement('div');
                progressBar.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(to right, #ff4444 0%, #ffaa44 40%, #44ff44 60%, #ffaa44 100%); position: relative;';

                const marker = document.createElement('div');
                marker.style.cssText = 'width: 4px; height: 100%; background: #fff; position: absolute; left: 0px; box-shadow: 0 0 10px #fff;';

                progressBar.appendChild(marker);
                progressContainer.appendChild(progressBar);
                display.appendChild(progressContainer);

                // Create stop button
                const stopBtn = document.createElement('button');
                stopBtn.textContent = 'STOP!';
                stopBtn.style.cssText = 'display: block; margin: 20px auto; padding: 15px 30px; background: #FF4444; color: white; border: none; border-radius: 5px; font-size: 18px; font-weight: bold; cursor: pointer;';
                
                // Add stop button to display
                display.appendChild(stopBtn);

                // Animation variables
                const speed = selectedTier === 'greedy' ? 3 : 2; // pixels per frame
                const maxPosition = 400 - 4; // container width minus marker width
                let animationId = null;

                // Stop handler - add BEFORE starting animation
                stopBtn.addEventListener('click', function stopHandler(e) {
                    e.preventDefault();
                    console.log('STOP BUTTON CLICKED! position:', markerPosition, 'isRunning:', isRunning);
                    if (!isRunning) {
                        console.log('Already stopped, ignoring click');
                        return;
                    }

                    isRunning = false;
                    clearInterval(animationId);
                    console.log('Animation stopped');

                    // Calculate result
                    const percentage = (markerPosition / maxPosition) * 100;
                    console.log('percentage:', percentage);
                    let grade = 'MISS';
                    let bonus = 0;
                    let label = 'Miss';

                    // Check PERFECT zone first (45-55%)
                    if (percentage >= 45 && percentage <= 55) {
                        grade = 'PERFECT';
                        bonus = selectedTier === 'greedy' ? 4 : 2;
                        label = 'Perfect Timing';
                    }
                    // Then check GOOD zone (40-60%)
                    else if (percentage >= 40 && percentage <= 60) {
                        grade = 'GOOD';
                        bonus = selectedTier === 'greedy' ? 2 : 1;
                        label = 'Good Timing';
                    }

                    console.log('FINAL RESULT:', { grade, bonus, label, percentage });

                    // Calculate exertion
                    const exertionDelta = selectedTier === 'greedy' ? (grade === 'MISS' ? 1 : 0) : 0;

                    // Show result immediately
                    instructions.innerHTML = '<div style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; color: ' + (grade === 'PERFECT' ? '#4CAF50' : grade === 'GOOD' ? '#FF9800' : '#F44336') + ';">' + label + '!</div>';
                    
                    // Hide overlay after delay
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        resolve({
                            bonus: bonus,
                            label: label,
                            grade: grade,
                            hitErrorMs: 0,
                            direction: 'center',
                            tier: selectedTier,
                            effectTags: [],
                            exertionDelta: exertionDelta,
                            beats: 1
                        });
                    }, 1500);
                });

                function animate() {
                    if (!isRunning) return;

                    markerPosition += speed * direction;

                    if (markerPosition >= maxPosition) {
                        markerPosition = maxPosition;
                        direction = -1;
                    } else if (markerPosition <= 0) {
                        markerPosition = 0;
                        direction = 1;
                    }

                    marker.style.left = markerPosition + 'px';
                }

                // Start animation AFTER setting up event listener
                isRunning = true;
                animationId = setInterval(animate, 16); // ~60fps
                console.log('Animation started, stop button ready');
            }
        });
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
    window.startTempoStrike = startTempoStrike;

})();
