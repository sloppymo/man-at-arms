// ============================================
// 03_combat.ink - Skirmish Encounters
// 8 combat scenarios for the chevauchée
// ============================================

EXTERNAL advanceTime(minutes)
EXTERNAL changeStat(stat, delta)
EXTERNAL addHeat(amount)
EXTERNAL triggerSkirmish(type)
EXTERNAL showImage(imagePath)

VAR combatOutcome = ""

-> combat_dispatcher

=== combat_dispatcher ===
~ temp encounter = RANDOM(1, 8)
{ encounter == 1: -> combat_patrol }
{ encounter == 2: -> combat_ambush }
{ encounter == 3: -> combat_defense }
{ encounter == 4: -> combat_peasant_resistance }
{ encounter == 5: -> combat_militia_stand }
{ encounter == 6: -> combat_knight_charge }
{ encounter == 7: -> combat_rear_guard }
{ encounter == 8: -> combat_breakout }
-> END

// ============================================
// COMBAT 1: French Patrol
// ============================================

=== combat_patrol ===
#speaker:narrator
#portrait:none
#music:combat_theme

You hear horses before you see them - the hollow clatter of shod hooves on stone, the jingle of harness. A French patrol, six riders, archers behind them in the dust.

They haven't seen you yet. The ditch offers concealment. The orchard offers cover. The open field offers... glory?

{showImage("artwork/patrol_contact.png")}

* [Ambush from the ditch]
    #stat:agility+2
    ~ temp roll = RANDOM(1, 4)
    { roll > 2:
        ~ combatOutcome = "victory"
        You rise like death itself, arrows in the first two riders before they react. Your sword takes a third. They break, flee, leave their wounded. You strip bodies, take horses, disappear.
    - else:
        ~ combatOutcome = "hard"
        #stat:stress+2
        They spot movement too soon. The fight becomes open work - sword against spear, horse against foot. You drive them off but take wounds doing it.
    }
    -> combat_resolution

* [Hide and let them pass]
    #stat:wits+1
    ~ temp roll = RANDOM(1, 3)
    { roll == 1:
        ~ combatOutcome = "surprise"
        #addHeat:10
        They spot you anyway - a glint of steel, a cough, bad luck. The ambush fails. You fight your way out, bloodied, grateful.
    - else:
        The patrol rides past, arguing in French about women and wine. You wait until sound fades. Safe. For now.
        -> END
    }
    {combatOutcome != "": -> combat_resolution}

* [Challenge the leader to single combat]
    #stat:strength+2
    #stat:reputation+5
    He accepts, dismounts, honors the code. His sword is fine, his arm strong. But Normans are not Welshmen, nor Scots. You kill him, drive off his men, add "sir" to your name, unofficial.
    ~ combatOutcome = "glory"
    -> combat_resolution

// ============================================
// COMBAT 2: Ambush in the Woods
// ============================================

=== combat_ambush ===
#speaker:narrator

The French came quietly. Militia, hunters, angry farmers. They know these woods - every deer trail, every stream crossing, every place a man gets stuck in mud.

You walked into their hands. Now you have to walk out.

{showImage("artwork/forest_ambush.png")}

* [Charge directly at their archers]
    #stat:endurance+2
    ~ temp roll = RANDOM(1, 3)
    { roll > 1:
        ~ combatOutcome = "victory"
        Arrows sting but don't stop you. Their bowmen die, their line breaks, you escape with holes in your mail and a new respect for Norman courage.
    - else:
        ~ combatOutcome = "wounded"
        #stat:stress+3
        The shaft takes you in the thigh. You fall. Your men drag you out, fighting. You'll limp for weeks, if you survive the infection.
    }
    -> combat_resolution

* [Fall back to the stream - defensive position]
    #stat:wits+1
    Water behind you is danger, but they can't flank you. You form a circle, shields out, fight them to standstill. Eventually the French lose stomach for slaughter. They fade into the woods. You survive.
    ~ combatOutcome = "standoff"
    -> combat_resolution

* [Scatter and regroup - every soldier for himself}
    #stat:agility+1
    You're no coward, but you're no fool either. You break through a weak point in their ring, run like a demon, hear the pursuit fade. By nightfall, you find three comrades. The rest? Unknown. Dead or fled.
    ~ combatOutcome = "scattered"
    -> combat_resolution

// ============================================
// COMBAT 3: Defensive Stand
// ============================================

=== combat_defense ===
#speaker:narrator

They caught you in the open, on a slope with poor footing. No choice but to stand and fight. Your shield locks with Welsh Tom's, then with Dick the archer. A wall of English desperation.

The French knights come like thunder.

{showImage("artwork/defensive_stand.png")}

* [Hold the line - discipline over glory]
    #stat:endurance+3
    #stat:wits+1
    They charge, you brace, the shock travels up your arm to your teeth. But you hold. They withdraw, regroup, come again. And again you hold. By the fifth charge, they're tired, bleeding, doubting. You survive.
    ~ combatOutcome = "survived"
    -> combat_resolution

* [Counter-charge when they hesitate]
    #stat:strength+2
    #stat:agility+1
    You sense their pause, their doubt, and explode forward. It's madness, reckless, exactly what they don't expect. The surprise carries you through their line, breaks their cohesion, sends them running. Insane. Effective.
    ~ combatOutcome = "breakthrough"
    -> combat_resolution

* [Signal for rescue - hope reinforcements arrive]
    ~ temp rescue = RANDOM(1, 3)
    { rescue == 1:
        #stat:luck+1
        Horns sound in the distance. English horns. The French hear them, hesitate, decide discretion serves God as well as valor. They withdraw. You live. Barely.
    - else:
        #stat:stress+3
        No one comes. You fight until you can't, your squad dissolves, the survivors straggle away in twos and threes. You lost friends. You lost face. You kept your life.
    }
    ~ combatOutcome = "endured"
    -> combat_resolution

// ============================================
// COMBAT 4: Peasant Resistance
// ============================================

=== combat_peasant_resistance ===
#speaker:narrator

You thought they'd flee. Most do. But these villagers have nowhere left to go - their families murdered, theirhomes burned, their priest dead. They fight with nothing left to lose.

Pitchforks and fury. Desperate men are dangerous.

{showImage("artwork/peasant_fight.png")}

* [Break them with steel and terror]
    #stat:strength+1
    #stat:reputation-2
    You kill three in the first minute, butcher's work. The rest break, but slowly, resentful. They'll reform, ambush, harass your retreat. You won. The fight continues.
    ~ combatOutcome = "pyrrhic"
    -> combat_resolution

* [Offer quarter to those who surrender]
    #stat:charisma+2
    #stat:morale+1
    "Drop the forks, keep your lives!" Some do. Some don't. Those who do are bound, harmless. Those who don't... you do what must be done. But fewer than could have died.
    ~ combatOutcome = "controlled"
    -> combat_resolution

* [Withdraw - not worth casualties}
    #stat:wits+1
    #stat:patronFavor-1
    You signal retreat. Your squad falls back, puzzled but obedient. The peasants pursue, but cautiously, afraid of trickery. You march away from an empty victory. Your commander won't understand.
    ~ combatOutcome = "avoided"
    -> combat_resolution

// ============================================
// COMBAT 5: Militia Stand
// ============================================

=== combat_militia_stand ===
#speaker:narrator

Proper militia this time - trained, equipped, organized. They hold the churchyard walls, the manor gate, the village crossroads. Pike and halberd, crossbow and bell.

They're waiting for you. They've been waiting.

{showImage("artwork/militia_stand.png")}

* [Feint left, strike right - misdirection}
    #stat:wits+2
    #stat:strength+1
    You threaten their flank with noise and movement, hit the weak point when they react. The wall falls, the pikes scatter, your sword tastes blood. Classic. Brutal.
    ~ combatOutcome = "outmaneuvered"
    -> combat_resolution

* [Overwhelm one position - focused strength}
    #stat:endurance+2
    #stat:strength+2
    You pick their strongest point, hit it with everyone. Overkill. Pride. But pride works when you're stronger. They break, flee, die. Nothing graceful about victory.
    ~ combatOutcome = "crushed"
    -> combat_resolution

* [Probe and withdraw - test their weaknesses}
    #stat:wits+1
    You feint attacks, watch their response, learn their positions. Tonight you'll report to your captain. Tomorrow he'll send real force. You survived, gathered intelligence, served the army. Enough.
    ~ combatOutcome = "recon"
    -> combat_resolution

// ============================================
// COMBAT 6: Knight's Charge
// ============================================

=== combat_knight_charge ===
#speaker:narrator

Hooves like thunder. The knight appears over the rise, lance lowered, banner streaming, armor blazing in sun. His horse is huge, trained to war, bred to kill.

This is what you fear. This is what men-at-arms die to.

{showImage("artwork/knight_charge.png")}

* [Receive the charge braced - stand firm}
    ~ temp roll = RANDOM(1, 3)
    { roll == 1:
        #stat:strength+3
        #stat:reputation+10
        You plant your feet, lower your spear, meet horse and rider with English steel. The shock breaks your arm. His skull shatters anyway. You stand over the fallen knight, screaming, lord of your own small battlefield. Glory.
        ~ combatOutcome = "legendary"
    - else:
        #stat:endurance+2
        #stat:stress+3
        The lance takes your shoulder, the horse tramples you, the knight rides past certain of your death. He was wrong. You'll carry this shoulder forever, but you survived a knight's charge.
        ~ combatOutcome = "survived_crushing"
    }
    -> combat_resolution

* [Evade and strike the horse}
    #stat:agility+2
    You roll aside as hooves thunder past, strike upward with desperate strength. The horse screams, stumbles, throws its rider. The knight dies reaching for his sword while you stand over him, panting, disbelieving.
    ~ combatOutcome = "clever_kill"
    -> combat_resolution

* [Run for the trees - survive today}
    #stat:agility+1
    #stat:reputation-3
    You sprint, dive, roll through underbrush. Hooves can't follow where you flee. The knight curses, rides for easier prey. You live with shame. Shame washes off.
    ~ combatOutcome = "fled"
    -> combat_resolution

// ============================================
// COMBAT 7: Rearguard Action
// ============================================

=== combat_rear_guard ===
#speaker:narrator

The main column moves ahead. You draw lot, you lose, you and six others form the rearguard. Slow march, watching your back, the dust of your friends rising ahead.

The French know. They always know. They come for stragglers.

{showImage("artwork/rear_guard.png")}

* [Form a shield wall - slow retreat}
    #stat:endurance+3
    #stat:morale+2
    You walk backwards, shields interlocked, step by measured step. They shoot, they charge, they break against your wall. Every step costs them dead. Every step brings you closer to safety. Discipline saves lives.
    ~ combatOutcome = "disciplined_retreat"
    -> combat_resolution

* [Charge them unexpectedly - aggression}
    #stat:strength+2
    #stat:agility+1
    They expect fleeing men. You attack instead. Their scouts die, their archers scatter, their discipline cracks. By the time they regroup, you've rejoined the column, laughing, bloodied, alive.
    ~ combatOutcome = "aggressive_survival"
    -> combat_resolution

* [Scatter and evade individually}
    ~ temp survivors = RANDOM(2, 6)
    You split, hide, wait for darkness. {survivors} of you find the column by morning. The rest? Who knows. Rearguard is lottery. You drew winning numbers.
    ~ combatOutcome = "scattered_survival"
    -> combat_resolution

// ============================================
// COMBAT 8: Breakout
// ============================================

=== combat_breakout ===
#speaker:narrator

They have you surrounded. French cavalry to the front, militia to the rear, woods crawling with bowmen on both flanks. No subtle now. No tactics. Just survival.

Your captain forms you into a wedge. One direction. Punch through or die.

{showImage("artwork/breakout.png")}

* [The point of the wedge - lead forward]
    #stat:strength+3
    #stat:endurance+2
    #stat:reputation+5
    You are the spear tip. Men die on your flanks, behind you, but you keep moving, cutting, killing. The French line cracks, breaks, and suddenly you're through, running, the column streaming past you. Leading breakthrough.
    ~ combatOutcome = "heroic_breakthrough"
    -> combat_resolution

* [The edge of the wedge - protect the vulnerable}
    #stat:endurance+2
    #stat:agility+1
    You fight on the flank, taking wounds meant for others. Shield to shield with men you hardly know. Together you emerge, battered, fewer, but together. Unity is survival.
    ~ combatOutcome = "group_escape"
    -> combat_resolution

* [Fall back to the center - stay mobile}
    #stat:wits+1
    #stat:agility+2
    You let bolder men take the point, slip through gaps in chaos, emerge with those who survived. Not glorious, not honorable, but you're alive and many heroes aren't. Choose your values.
    ~ combatOutcome = "pragmatic_escape"
    -> combat_resolution

// ============================================
// COMBAT RESOLUTION
// ============================================

=== combat_resolution ===
{ combatOutcome:
- "victory": -> victory_res
- "hard": -> hard_res
- "wounded": -> wounded_res
- "standoff": -> standoff_res
- "scattered": -> scattered_res
- "survived": -> survived_res
- "breakthrough": -> breakthrough_res
- "endured": -> endured_res
- "pyrrhic": -> pyrrhic_res
- "controlled": -> controlled_res
- "avoided": -> avoided_res
- "outmaneuvered": -> outmaneuvered_res
- "crushed": -> crushed_res
- "recon": -> recon_res
- "legendary": -> legendary_res
- "survived_crushing": -> survived_crushing_res
- "clever_kill": -> clever_kill_res
- "fled": -> fled_res
- "disciplined_retreat": -> disciplined_res
- "aggressive_survival": -> aggressive_res
- "scattered_survival": -> scattered_res
- "heroic_breakthrough": -> heroic_res
- "group_escape": -> group_res
- "pragmatic_escape": -> pragmatic_res
}
-> END

=== victory_res ===
#speaker:narrator

You stand among the dead, count your wounds, accept your loot. Another fight, more survivors, richer by a few coins. The campaign continues. So do you.

#stat:experience+2
#stat:stress-1
-> END

=== hard_res ===
#speaker:narrator

Bloodied but unbroken. You'll need stitches, rest, perhaps a surgeon if infection sets in. But you held. You fought. That matters.

#stat:experience+1
#stat:morale+1
-> END

=== wounded_res ===
#speaker:narrator

The field surgeon does terrible, necessary work. You scream, curse, threaten. Then blessed poppy, darkness, and waking with something missing or added. A scar to add to your collection.

#stat:endurance-1
#stat:stress+2
-> END

=== standoff_res ===
#speaker:narrator

Neither side won. Both survived. Sometimes that's the best outcome possible. You march on, watch your back, remember that the French were brave today.

#stat:experience+1
-> END

=== scattered_res ===
#speaker:narrator

You're alive alone. Comrades dead, captured, or fled. Regroup with the column, find familiar faces, try to remember who you were before the slaughter.

#stat:morale-2
#stat:stress+1
-> END

=== survived_res ===
#speaker:narrator

Against the odds, you endured. Technique and discipline overcome numbers. That's what training is for.

#stat:experience+2
#stat:reputation+2
-> END

=== breakthrough_res ===
#speaker:narrator

Audacity rewarded. Your legend grows with each reckless success. Eventually the odds catch up. But not today.

#stat:reputation+5
#stat:experience+2
-> END

=== endured_res ===
#speaker:narrator

You held. That's all that mattered. Holding is victory when victory means survival.

#stat:endurance+1
-> END

=== pyrrhic_res ===
#speaker:narrator

You won. What price? What did it cost? Sometimes winning hurts worse than losing.

#stat:experience+1
#stat:stress+2
-> END

=== controlled_res ===
#speaker:narrator

Restraint in battle is harder than slaughter. You showed both skill and mercy. That's rare. That's valuable.

#stat:reputation+3
#stat:experience+2
-> END

=== avoided_res ===
#speaker:narrator

The fight you avoid is the fight you don't lose. Wisdom or cowardice? Time will tell.

#stat:wits+1
-> END

=== outmaneuvered_res ===
#speaker:narrator

Tactics over brute force. The smarter warrior wins wars, not just battles.

#stat:wits+2
#stat:experience+1
-> END

=== crushed_res ===
#speaker:narrator

Dominance demonstrated. The enemy broke before your power. Let them remember this moment.

#stat:strength+1
#stat:reputation+3
-> END

=== recon_res ===
#speaker:narrator

Intelligence gathered today saves lives tomorrow. Your role was support, not glory. Both matter.

#stat:wits+1
#stat:patronFavor+1
-> END

=== legendary_res ===
#speaker:narrator

Men will speak of this moment. Ballads, maybe, or barracks boasts. You slew a knight on foot. Against the odds. Against reason.

#stat:experience+3
#stat:reputation+10
-> END

=== survived_crushing_res ===
#speaker:narrator

The knight thought you dead. You disagreed. Now you walk with a story and a scar.

#stat:experience+2
#stat:endurance+2
-> END

=== clever_kill_res ===
#speaker:narrator

Brains over brawn. The horse was easier than the man. Both dead serves the same.

#stat:agility+1
#stat:experience+1
-> END

=== fled_res ===
#speaker:narrator

You live. That's the important part. The rest is reputation, ego, pride. Pride heals. Death doesn't.

#stat:stress-1
#stat:morale-1
-> END

=== disciplined_res ===
#speaker:narrator

Formation, discipline, mutual protection. That's how soldiers survive. Individual heroes die. Units endure.

#stat:morale+2
#stat:experience+2
-> END

=== aggressive_res ===
#speaker:narrator

Unexpected aggression confuses enemies. They expect retreat, receive steel. Surprise is warfare.

#stat:agility+1
#stat:reputation+2
-> END

=== scattered_res ===
#speaker:narrator

Every man for himself. Not elegant. Not honorable. But some survived. That's the measure.

-> END

=== heroic_res ===
#speaker:narrator

At the front, at the point, leading through hell. That's where songs come from.

#stat:strength+2
#stat:reputation+10
-> END

=== group_res ===
#speaker:narrator

Shield to shield, brother to brother. You survived together. That's better than surviving alone.

#stat:morale+3
-> END

=== pragmatic_res ===
#speaker:narrator

War rewards survival, not style. You chose to live. Let bolder men choose otherwise.

-> END
