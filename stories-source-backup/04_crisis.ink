// ============================================
// 04_crisis.ink - Heat Escalation & Chapter Climax
// French response intensifies, final battle, Calais arrival
// ============================================

EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL addHeat(amount)
EXTERNAL changeStat(stat, delta)
EXTERNAL addItem(itemId, qty)
EXTERNAL removeItem(itemId, qty)
EXTERNAL hasItem(itemId)
EXTERNAL discoverHex(q, r)
EXTERNAL triggerSkirmish(type)
EXTERNAL triggerCombat(enemyId)
EXTERNAL showImage(imagePath)

VAR heatLevel = 0
VAR crisisStage = 0
VAR outcome = ""

-> heat_check

=== heat_check ===
#speaker:narrator
#portrait:none
#music:tension_building

The countryside knows you're here now. Smoke on the horizon, burned villages, terrified refugees speaking of English devils. Word reaches Rouen. Word reaches Paris.

{showImage("artwork/heat_rising.png")}

~ temp randomNotice = RANDOM(1, 3)
{ randomNotice == 1: A shepherd boy spotted your column two days back, ran for the nearest knight's manor. }
{ randomNotice == 2: A merchant survived your raid, reached Caen with tales of burning and butchery. }
{ randomNotice == 3: French scouts found one of your campfires still warm, counted bootprints in the mud. }

The French are responding.

-> check_heat_threshold

=== check_heat_threshold ===

{ heatLevel < 30:
    -> heat_low
- heatLevel < 60:
    -> heat_medium
- heatLevel < 85:
    -> heat_high
- else:
    -> heat_critical
}

// ============================================
// HEAT STAGE 1: Low (0-29)
// ============================================

=== heat_low ===
~ crisisStage = 1

The French have noticed. Local militia drill more regularly. Peasants leave fields untended, watching roads instead. But you're not yet hunted - just unwelcome.

{showImage("artwork/low_heat.png")}

* [Press advantage while they're disorganized]
    #addHeat:10
    #stat:wealth+8
    You raid faster, hit harder, move before word spreads. A village untouched this morning burns by noon. Speed is safety.
    -> patrol_encounter

* [Slow down, avoid unnecessary raids]
    #stat:wits+1
    #stat:stress-1
    The army has time. You have supplies. Let the French chase shadows while you march steady toward Calais.
    -> END

* [Spread false rumors of your position]
    #addHeat:5
    #stat:charisma+1
    You capture a peasant, make him "escape" with false intelligence. French patrols ride east while you move west. Deception buys time.
    -> END

=== patrol_encounter ===
#speaker:narrator

Your boldness earns attention. A French patrol - heavier than before, ten riders with a sergeant-at-arms leading.

They haven't seen you yet. The hedgerow offers concealment. The open field offers speed. Neither offers safety.

{showImage("artwork/patrol_contact.png")}

* [Ambush them in the lane]
    #stat:agility+2
    #triggerSkirmish:patrol
    You rise from the ditch, arrows in the lead horses, then steel in the confusion. You kill four, the rest flee. But they flee with your description.
    -> END

* [Hide and let them pass]
    #stat:wits+1
    ~ temp spotted = RANDOM(1, 4)
    { spotted == 1:
        #addHeat:15
        A horse steps on a dry branch. Heads turn. Eyes meet. You run. They chase. The hunt begins.
        -> hunted_sequence
    - else:
        They pass so close you smell wine on their breath, hear their complaints about Normandy mud. You let them go. Live to raid another day.
        -> END
    }

* [Fall back and find your squad]
    #stat:morale+1
    Safety in numbers. You withdraw, gather your men, march cautious. The patrol searches empty fields while you move on.
    -> END

// ============================================
// HEAT STAGE 2: Medium (30-59)
// ============================================

=== heat_medium ===
~ crisisStage = 2

French militia are active now - not just local peasants, but trained men with crossbows and pikes. Cavalry patrols ride the main roads. Messengers carry warnings between towns.

You're being hunted, but not yet trapped.

{showImage("artwork/medium_heat.png")}

* [Attack a militia outpost - strike first]
    #addHeat:15
    #stat:strength+2
    #triggerCombat:militia_outpost
    Before they can organize against you, you hit them. Kill the leaders, burn the records, scatter the men. Violence of action confuses them.
    -> post_militia

* [Avoid roads entirely - march cross-country}
    #stat:endurance+2
    #stat:agility+1
    Fields, forests, streams. Slower. Harder. But invisible to patrols. You arrive at Calais exhausted but whole.
    -> bypass_checkpoint

* [Disguise as French reinforcements}
    #stat:wits+2
    #stat:charisma+1
    You capture French cloaks, mimic their formations, march bold as brass past peasant witnesses. Audacity is camouflage.
    -> END

=== post_militia ===
#speaker:narrator

The outpost lies in ruins. Your men loot what they can - crossbows are valuable, mail is heavy. But the smoke rises like a signal fire.

* [Press on immediately - don't linger]
    #addHeat:5
    You march before pursuit can organize. Leave dead, leave wounded, leave anything that slows you. Speed.
    -> END

* [Gather intelligence first - papers, prisoners}
    #stat:wits+2
    Maps, messages, a captured clerk willing to talk. You learn the French have cavalry at Lisieux, archers gathering at Pont-Audemer. Knowledge.
    -> END

* [Rest the men - they fought hard}
    #stat:morale+2
    #advanceTime:240
    #addHeat:10
    Two hours to bind wounds, eat cold rations, breathe. The French use that time to close the distance. But your men fight better fed than starving.
    -> END

=== bypass_checkpoint ===
#speaker:narrator

Cross-country marching brings its own dangers. Swamp, dense woods, rivers without bridges. But also... discovery.

{showImage("artwork/forest_path.png")}

* [Find a smuggler's path]
    #stat:agility+1
    #stat:wits+1
    Old tracks, half-overgrown. Someone moved goods this way once - salt, wool, whatever merchants smuggle. Now you move soldiers. The path leads around French positions.
    -> END

* [Stumble onto a hidden monastery}
    #addHeat:8
    #stat:wealth+12
    A valley monastery, forgotten by maps, rich with tithes. They surrender quickly, hide nothing well. Silver, preserves, wine. Your men feast tonight.
    -> END

* [Cross a dangerous ford - save hours}
    #stat:endurance+2
    ~ temp roll = RANDOM(1, 3)
    { roll == 1:
        #stat:stress+2
        The current takes a man - swept away, screaming, gone in brown water. You ford anyway, lose more time retrieving his body. War doesn't pause for drowning.
    - else:
        Cold, wet, miserable. But the far bank means safety. You cross.
    }
    -> END

// ============================================
// HEAT STAGE 3: High (60-84)
// ============================================

=== heat_high ===
~ crisisStage = 3

The French king has taken notice. Royal messengers ride with orders: hunt the English raiders. Professional soldiers replace militia. Cavalry commands the roads.

You are in the net, but not yet caught.

{showImage("artwork/high_heat.png")}

* [Make a desperate dash for Calais}
    #addHeat:10
    #stat:agility+2
    #stat:endurance+2
    No more raiding. No more villages. Just miles, day and night, pushing toward the coast. Men stumble, horses founder, but you move.
    -> race_to_calais

* [Set a false trail south}
    #stat:wits+2
    #addHeat:5
    You detach five men with spare horses, ride south burning farms, drawing pursuit. The main column slips north. Sacrifice and survival.
    -> END

* [Stand and fight - bloody nose deters pursuit}
    #stat:strength+3
    #triggerCombat:cavalry_patrol
    #addHeat:20
    You choose ground - a narrow lane, a sunken road - and wait. The French cavalry charges into prepared spears. They die. Their comrades hesitate. You escape in the confusion.
    -> END

=== race_to_calais ===
#speaker:narrator

The column strings out. Stragglers fall behind, prey for French patrols. You push the pace, driving men past exhaustion.

Ahead: a French roadblock across the main valley.

{showImage("artwork/roadblock.png")}

* [Overrun the roadblock - shock and speed}
    #stat:strength+2
    #stat:agility+1
    #triggerSkirmish:roadblock
    No time for tactics. Run at them, screaming, shields up. They panic under sudden assault. You burst through, leave the wounded behind, keep running.
    -> END

* [Climb the escarpment - avoid the valley entirely}
    #stat:endurance+3
    The goat path is steep, rocky, barely a trail. You haul yourself up, help others, leave horses. But above the roadblock, you roll boulders down on French heads and laugh while running.
    -> END

* [Bribe the guards - everyone has a price}
    #stat:charisma+2
    #stat:wealth-25
    French sergeants earn little. You offer what you have. Eyes meet. The barrier lifts, the guards look away. Silver opens gates gold cannot.
    -> END

// ============================================
// HEAT STAGE 4: Critical (85+)
// ============================================

=== heat_critical ===
~ crisisStage = 4

They have you. French armies converge from three directions. The King himself commands - or his marshals, which is worse. Cavalry on every road, archers in every wood, pike blocks on every hill.

This is the end. One way or another.

{showImage("artwork/critical_heat.png")}

* [The only way out is through - punch north}
    #stat:strength+3
    #stat:endurance+3
    #stat:morale+2
    You form a column, shields interlocked, spears forward. Arrows fall. Men die. But the column moves. Step by bloody step, toward Calais.
    -> final_battle

* [Disperse and evade - every man finds his own way}
    #stat:agility+2
    #stat:wits+1
    You scatter into the countryside like seeds on wind. Some will reach Calais. Some will starve. Some will hang as bandits. But some will survive.
    -> scattered_survival

* [Surrender with terms - save the men}
    #stat:charisma+2
    #stat:reputation+5
    #stat:stress+5
    You find a French knight, negotiate. Lay down arms in exchange for ransom, not execution. Dishonor. Survival is dishonor's reward.
    -> ransom_sequence

// ============================================
// FINAL BATTLE
// ============================================

=== final_battle ===
#speaker:commander
#portrait:patron_commanding
#music:epic_combat

"Form line! Shields up! This is where we stand, lads. This is where England wins or dies! The French think they've trapped us. Show them what Englishmen do in tight places!"

{showImage("artwork/final_stand.png")}

The valley narrows ahead. If you can break through the blocking force, open country leads to Calais. If you fail...

* [Take the vanguard - lead the charge]
    #stat:strength+3
    #stat:experience+5
    #stat:reputation+10
    ~ temp charge = RANDOM(1, 3)
    { charge > 1:
        ~ outcome = "victory"
        You crash into their line like a hammer on glass. Shields splinter, men fall, and suddenly you're through, screaming, bleeding, victorious. The gap opens. The column pours through.
    - else:
        ~ outcome = "wounded_victory"
        #stat:endurance-1
        The impact breaks something in your shoulder. Pain whites out your vision. But you hold position until others break through, then stumble after, dangling arm, weeping from the pain. But through.
    }
    -> battle_resolution

* [Hold the flank - protect the vulnerable}
    #stat:agility+2
    #stat:endurance+2
    French cavalry tries to roll your line from the side. You pivot, brace, take the charge on shields and spears. Horses scream. Men die. But the flank holds. The column keeps moving.
    ~ outcome = "defended"
    -> battle_resolution

* [Guard the stragglers - no one left behind}
    #stat:charisma+3
    #stat:morale+5
    You move among the fallen, the limping, the terrified. "Up," you say. "Walk. I walk with you." And they do. Slowly, painfully, but moving. Your presence drags them through the gap.
    ~ outcome = "saved_many"
    -> battle_resolution

=== battle_resolution ===
#speaker:narrator

The French break. Not defeated - you couldn't defeat them all. But their line is torn, their nerve uncertain. They let you go.

{showImage("artwork/battle_aftermath.png")}

{ outcome:
- "victory": 
    You led the breakthrough. Men will speak of this charge. Songs, maybe. For now: bandages, water, the road to Calais open before you.
    #stat:stress-3
    #stat:patronFavor+5
- "wounded_victory":
    Your shoulder will never be right again. But you're alive. The surgeon does his terrible work. You live with the pain.
    #stat:stress-2
- "defended":
    The flank held. That's what matters. Units that break die. Units that hold survive. You held.
    #stat:agility+1
- "saved_many":
    Eight more men walk into Calais because of you. Eight lives, eight futures, eight stories that continue because you wouldn't leave them.
    #stat:reputation+8
}

-> calais_arrival

// ============================================
// ALTERNATE ENDINGS
// ============================================

=== scattered_survival ===
#speaker:narrator

You run alone. Days pass. You eat berries, steal from farms, avoid every road. The French hunt, but Normandy is large and you are desperate.

* [Find English stragglers - reform]
    #stat:morale+2
    After three days, you find four others. Together you move, quieter, faster. The column fragments, but fragments can reform.
    ~ outcome = "reformed"
    -> calais_tattered

* [Capture French clothes - blend in]
    #stat:wits+3
    You take a dead soldier's clothes, practice his accent, limp into a village as a wounded French peasant. They feed you. You rest. Then slip north in darkness.
    -> END

* [Join a band of English stragglers turned bandit}
    #stat:reputation-5
    #stat:wealth+15
    They're no longer soldiers - just men surviving by any means. You ride with them, rob French farms, live outside the war. Eventually you reach Calais, but changed. Different.
    -> END

=== ransom_sequence ===
#speaker:narrator

The French are honorable in their way. You surrender, they accept. Iron bonds replace steel blades. You wait in a Norman castle for English gold to buy your freedom.

{showImage("artwork/captivity.png")}

* [Negotiate your own ransom early}
    #stat:charisma+2
    #stat:wealth-100
    You convince them you're worth more alive than holding. A quick payment, a sworn oath not to fight for six months (which you'll break in six hours), and you walk north.
    -> END

* [Wait for army ransom funds}
    #advanceTime:10080
    #stat:stress+5
    Two weeks in darkness, eating French gruel, wondering if anyone remembers you. Then suddenly: English herald, gold, freedom. You emerge pale, thinner, but free.
    #stat:endurance+1
    -> END

* [Escape during transfer}
    #stat:agility+2
    On the road to Rouen, your guard grows careless. A loose knot, a moment of inattention, and you're running. Behind you, shouts, arrows, but you're in the woods, you're free, you're surviving.
    -> END

// ============================================
// CALAIS ARRIVAL - CHAPTER COMPLETE
// ============================================

=== calais_arrival ===
#speaker:narrator
#portrait:none
#music:victory_theme

The walls of Calais rise from the coastal plain, English banners flying, the port full of English ships. You made it. Somehow, impossibly, you made it.

{showImage("artwork/calais_arrival.png")}

Men cheer as you enter the gate. Guards who have seen nothing but terror from French lands gaze at you with something like awe. You came through hell and survived.

~ temp finalWealth = 0
~ temp finalRep = 0

* [Report to your patron immediately]
    #stat:patronFavor+10
    You find {patronName} in the command tent. He looks up, sees you alive, laughs loud enough to startle the generals. "I had bets against you, soldier. I'll pay them gladly."
    -> final_reckoning

* [Find a surgeon - you're hurting}
    #stat:endurance+2
    #stat:stress-3
    The wounds you've ignored demand attention. Blood poisoning, infected cuts, cracked ribs. You lie in the hospital tent while others celebrate. But you heal. You live.
    -> final_reckoning

* [Drink with the survivors - you earned it}
    #stat:morale+5
    #stat:stress-5
    The taverns of Calais overflow with soldiers and their coin. You drink until you forget the faces of the dead, the screams of burning villages, the weight of your sins. For one night, you're just a man with money.
    -> final_reckoning

=== calais_tattered ===
#speaker:narrator

You arrive at Calais a ragged band of stragglers - twenty men where your squad once held sixty. But you arrive.

The guards question you closely. Deserters sometimes try this trick. But your wounds are fresh, your story consistent, and eventually they wave you through.

"Another group from the chevauchée. Welcome to Calais, lads. You're safe now."

Safe. The word sounds strange.

-> final_reckoning

=== final_reckoning ===
#speaker:narrator

Days pass. The army reorganizes, resupplies, plans the siege. Your achievements - your raids, your battles, your survival - become stories, then statistics, then eventually just memory.

But for now:

Final accounting:

{showImage("artwork/campaign_complete.png")}

~ finalWealth = 0
~ finalRep = 0

// Wealth calculation placeholder
~ finalWealth = 45
~ finalRep = 12

**Wealth acquired:** {finalWealth} silver pieces
**Reputation earned:** {finalRep} points of renown
**Heat generated:** {heatLevel} (French awareness)
**Raids completed:** {raidCount}
**Patron favor:** Strong

* [Look toward the next campaign]
    #setflag:chevauchee_complete
    Calais must be taken. The siege will be long. But you've survived the burning of Normandy. Whatever comes next...
    
    You're ready.
    -> END

* [Rest and recover - war can wait]
    #stat:stress-5
    #stat:morale+3
    You find quiet corner in a busy port, sleep for days, eat until you're sick of food. War has consumed months of your life. It can wait a month more for your return.
    -> END

* [Write home - if you have anyone}
    #stat:stress-2
    The letter is short: "Alive. Calais. Send money." But you write it. Someone might care enough to read it.
    -> END

// ============================================
// CRISIS EVENTS (interruptors during main heat)
// ============================================

=== hunted_sequence ===
#speaker:narrator

They know your direction now. Cavalry hounds you across open country, infantry tries to cut off escape routes. You are the fox. They are the hounds.

{showImage("artwork/hunted.png")}

* [Find refuge in a peasant's barn]
    ~ temp help = RANDOM(1, 3)
    { help == 1:
        #stat:stress-1
        #stat:morale+1
        He hides you. Risking his life for an enemy soldier. "My grandfather was English," he whispers. Blood ties cross borders. The French patrol rides past his door.
    - else:
        #triggerCombat:search_party
        He hides you, then betrays you for silver. You fight your way out through his back window, bleeding, cursing his name and your trust.
    }
    -> END

* [Break into smaller groups - harder to track}
    #stat:agility+1
    Three men per group, different directions, rendezvous at a river marker. Most groups make it. Some don't. War is arithmetic of survival.
    -> END

* [Stand and fight the pursuit}
    #stat:strength+2
    #triggerSkirmish:pursuit
    You find high ground, make them pay for every step. They take you eventually - numbers always win. But you take ten of them first.
    -> END
