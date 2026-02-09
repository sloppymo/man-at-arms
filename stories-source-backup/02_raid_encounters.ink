// ============================================
// 02_raid_encounters.ink - Village Raid Scenarios
// 15 distinct raid encounters for the chevauchée
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

VAR raidCount = 0

-> raid_dispatcher

=== raid_dispatcher ===
~ raidCount = raidCount + 1
~ temp raid = RANDOM(1, 15)
{ raid == 1: -> raid_small_hamlet }
{ raid == 2: -> raid_mill_village }
{ raid == 3: -> raid_manor_estate }
{ raid == 4: -> raid_church_village }
{ raid == 5: -> raid_fortified_farm }
{ raid == 6: -> raid_wine_village }
{ raid == 7: ->raid_river_crossing }
{ raid == 8: -> raid_forest_village }
{ raid == 9: -> raid_merchant_convey }
{ raid == 10: -> raid_abandoned_castle }
{ raid == 11: -> raid_cultivated_fields }
{ raid == 12: -> raid_bridge_town }
{ raid == 13: -> raid_granary_village }
{ raid == 14: -> raid_quarrier_settlement }
{ raid == 15: -> raid_burned_ruins }
-> END

// ============================================
// VILLAGE 1: Small Hamlet
// ============================================

=== raid_small_hamlet ===
#speaker:narrator
#portrait:none
#music:raid_tension

The hamlet is barely a dozen buildings: farms, a smithy, a chapel no bigger than a barn. Peasants scatter like chickens before the hawk - old ones hobbling toward the woods, young ones carrying babes and bread.

Your squad has fifteen minutes before the main column arrives. Fifteen minutes to take what you can, burn what you can't.

{showImage("artwork/hamlet_raid.png")}

* [Torch everything quickly]
    #addHeat:15
    #stat:wealth+10
    #stat:stress+2
    
    Fire and smoke. The thatch catches fast, the timber slower. You work through buildings methodically, taking food, coins, a few tools. The peasants watch from the treeline. They'll remember you.
    -> raid_outcome

* [Focus on the chapel - religious sites]
    #addHeat:8
    #stat:wealth+15
    #stat:reputation-5
    
    The chapel holds the village treasure: silver candlesticks, a jeweled reliquary, vestments worth a knight's ransom. God rewards sinners generously.
    -> raid_outcome

* [Try to spare the farmers]
    #setflag:spared_hamlet
    #stat:reputation+5
    #stat:patronFavor-2
    
    You drive the farmers off with threats, shout, shove. But you don't burn their homes. This winter they'll shelter in ashes. Now - just fields and forest. Small mercy.
    -> raid_outcome

=== raid_outcome ===
{ RANDOM(1, 4) == 1: -> raid_complication }
-> END

=== raid_complication ===
#speaker:narrator

But word travels fast in the countryside. A French patrol spotted your smoke, rides hard to investigate.

* Fight!
    #triggerSkirmish:militia
    You stand your ground with three companions. The fight is brief but fierce. Two Frenchmen down, your squad bloodied. You take their horses, their coin purses, ride on.
    -> END

* Scatter and hide
    #stat:agility+1
    You flee into the woods, find the gully where you cached supplies. The patrol rides past, cursing, smelling smoke, seeing only fleeing shadows. Safe. For now.
    -> END

* Blend in - wear French cloaks
    ~ temp roll = RANDOM(1, 3)
    { roll == 1:
        #stat:wits+2
        The cloaks fit poorly, smell of French sweat. But in the smoke, at dusk, you look like wounded locals. The patrol passes, shouting questions. Your Norman is poor. Your silence is eloquent.
    - else:
        #triggerCombat:patrol_sergeant
        "English dogs!" The officer sees through your ruse instantly. His sword clears scabbard. Time to earn your silver.
    }
    -> END

// ============================================
// VILLAGE 2: Mill Village
// ============================================

=== raid_mill_village ===
#speaker:narrator

A village grown around a water mill - the river powers the grindstones, the miller powers the local economy. Grain comes here from ten miles around. Burn it, and you starve the countryside.

The miller's house is stone, defensible. He's barricaded inside with his sons and his strongbox.

{showImage("artwork/mill_raid.png")}

* [Burn the mill - strategic target]
    #addHeat:20
    #stat:patronFavor+3
    The stones survive, blackened. The timber burns magnificently, the grain roasts in the heat. A pillar of smoke visible for leagues. The army will see your work. Your lord will approve.
    -> END

* [Negotiate with the miller}
    #stat:charisma+1
    #stat:wits+1
    You talk through his shuttered window. He gives you silver, you promise to leave his mill standing. Both of you lie a little. Both of you keep enough truth to function.
    -> END

* [Storm the house - take everything}
    #triggerSkirmish:defenders
    #addHeat:12
    #stat:wealth+20
    They fight. Boys with bows become men with stakes. You lose a companion taking the door. Inside: silver, grain, the miller's daughters hiding in the root cellar. The cost of conquest.
    -> END

// ============================================
// VILLAGE 3: Manor Estate
// ============================================

=== raid_manor_estate ===
#speaker:narrator

A proper manor house - stone foundation, timber upper floors, a defensive wall around the yard. This is Norman gentry, not peasants. They've had warning. The gate is barred, archers on the wall.

Your commander wants this one. He wants it badly.

{showImage("artwork/manor_raid.png")}

* [Lead the assault]
    #stat:strength+2
    #stat:experience+3
    #triggerCombat:manor_defenders
    Over the wall with ladders, through the gate with axes. You lead from the front. Bolts skim your helm. Stones fall. You gain the wall, the yard, the great hall. The lordling dies defending his hearth. You plunder a knight's ransom.
    -> END

* [Set fire to the outbuildings - smoke them out}
    #addHeat:18
    #stat:wits+1
    The barns burn well - livestock, hay, the manor's economy. Smoke pours through arrow-slits. Coughing, the defenders stumble into your arms. Less glory. More efficiency.
    -> END

* [Wait for the main force}
    #stat:patronFavor-1
    #stat:morale-1
    You hold position. Wait. The manor resists lightly armed men; it falls before a proper siege. You missed your chance for distinction. Others took your share.
    -> END

// =========================================ADE 4: Church Village
// ============================================

=== raid_church_village ===
#speaker:narrator

This village's church is its center - stone, respectable, with a proper bell tower. The priest has organized resistance. Peasants stand with him, armed with faith and farm tools.

Religious war, made literal.

{showImage("artwork/church_raid.png")}

* [Take the church - symbol means everything}
    #addHeat:25
    #stat:reputation+5
    #triggerSkirmish:religious_resistance
    You breach the doors, drag out priest and parishioners. The church silver is yours. The priest protests in Latin you don't understand and don't care to. English boots on Norman stone. History is cruel.
    -> END

* [Leave the church - take the houses}
    #addHeat:10
    #stat:wealth+12
    The priest watches from his tower as you burn the village around him. The church stands untouched, his parishioners homeless. He'll remember this mercy. Or resent your selectivity.
    -> END

* [Try to convert the priest - political value}
    #stat:charisma+2
    #stat:wits+1
    { RANDOM(1, 3) == 1:
        He listens. Swallows his pride. "For the safety of my flock," he says. You have a guide now, a translator, an intelligence source. The King values such assets.
    - else:
        "Never!" His people fight harder for his courage. You take the church eventually. No converts. More bodies.
    }
    -> END

// ============================================
// VILLAGE 5: Fortified Farm
// ============================================

=== raid_fortified_farm ===
#speaker:narrator

A yeoman farmer has built well: stone barn, wooden palisade, a tower for lookouts. He's wealthy, suspicious, prepared. Crossbow loopholes in the barn walls. Dogs trained to kill.

Hard target. Rich target.

{showImage("artwork/fortified_farm.png")}

* [Night assault - surprise them}
    #stat:agility+2
    #triggerSkirmish:prepared_defenders
    You slip through the dark, kill the dogs silent, scale the palisade. Inside, chaos. The farmer fights, falls. His daughters scream. His silver fills your saddlebags.
    -> END

* [Set siege and starve them out}
    #advanceTime:1440
    #stat:endurance+1
    Two days of waiting. They hold a day longer. But water runs out, hope runs out, the gate opens. You take them weak, grateful for the end. No glory. Total victory.
    -> END

* [Burn them out and pick the ruins}
    #addHeat:15
    #stat:wealth+8
    You can't risk your men on stone walls. Fire solves it. They flee or die. The farmer burns with his strongbox. You pick through charcoal for melted silver. Effective. Ugly.
    -> END

// ============================================
// VILLAGE 6: Wine Village
// ============================================

=== raid_wine_village ===
#speaker:narrator

Normandy's vineyards produce for Paris and Rouen. This village lives for the grape: cellars full of casks, presses busy in harvest, wine aged enough to command prices.

The monks who own the land have fled. The vintners remain to protect their work.

{showImage("artwork/wine_village.png")}

* [Take the cellars - wine is wealth}
    #item:add:wine_casks:5
    #stat:wealth+25
    You load wagons. White, red, the monks' best reserved for kings. Your squad will drink well. Your captain will sell better. The vintage survives its change of ownership.
    -> END

* [Drink now, burn later}
    #stat:morale+4
    #stat:stress-2
    #addHeat:10
    Why wait for Calais? You broach a good cask, share around, feel the Normandy sun soften. Then burn what you can't carry. The villagers find you drunk, singing. Dangerous. Worth it.
    -> END

* [Spare it - wine sours on long marches}
    #stat:wits+1
    #stat:reputation+3
    You take coin instead, silver the vintners hid from your brothers. Pragmatic. The wine stays for French throats. Your sobriety keeps you alive when drunk men die.
    -> END

// ============================================
// VILLAGE 7: River Crossing
// ============================================

=== raid_river_crossing ===
#speaker:narrator

A ferry crossing, a bridge, a ford - this point gets everyone across the river. Trade caravans, refugees, fleeing gentry. Today: you.

The ferryman demanded payment. You demanded passage. His sons demanded their father's life.

{showImage("artwork/river_raid.png")}

* [Hold the crossing - tax everyone}
    #addHeat:20
    #stat:wealth+30
    You fortify the near bank. Every Norman who wants to cross pays. Every Frenchman who tries to cross fights. You become wealthy, notorious, a problem your commander will need to solve.
    -> END

* [Raid the far bank - surprise them}
    #stat:agility+2
    #triggerSkirmish:river_patrol
    You cross at night, strike villages that thought the river protected them. They learn. You plunder. Then back across before pursuit organizes.
    -> END

* [Just cross - speed matters more than silver}
    #stat:patronFavor+2
    Your squad moves fast, keeps the army's pace. Others get rich at crossings. You keep the column together, reach Calais with unit intact. Discipline has its own reward.
    -> END

// ============================================
// VILLAGE 8: Forest Village
// ============================================

=== raid_forest_village ===
#speaker:narrator

Hidden in the woods, this village has escaped notice before. Hunters, charcoal burners, woodcutters. Simple folk, simple lives, suddenly complicated by English arrival.

They know the forest better than you. Danger and opportunity.

{showImage("artwork/forest_village.png")}

* [Use local guides - they know paths}
    #stat:wits+2
    { RANDOM(1, 2) == 1:
        #setflag:forest_guides
        You spare their homes, take hostages instead. They show you secret trails, hidden caches, enemy movements. Intelligence worth more than plunder. For now.
    - else:
        #triggerSkirmish:bushwhack
        They lead you into an ambush, your hostages escape, you fight out of the trap bloodied and embarrassed. Trust is expensive.
    }
    -> END

* [Burn the woods around them}
    #addHeat:30
    #stat:wealth+5
    Fire in the forest is... unpredictable. It spreads, consumes, clears acres of cover. The village burns with the trees. But the army's movement is exposed, vulnerable. Pyrrhic.
    -> END

* [Pass through quietly - not worth the time}
    #stat:stress-1
    #stat:morale+1
    Not every village needs burning. You mark it for later, move on. The hunters watch you pass, wonder at your mercy. Whether they appreciate it or resent it, you'll never know.
    -> END

// ============================================
// VILLAGE 9: Merchant Convoy
// ============================================

=== raid_merchant_convey ===
#speaker:narrator

Not a village - merchants fleeing ahead of your approach. Wagons loaded with inventory, wealth on wheels, slow and tempting.

They have guards. Professional men, not farmers. Fair fight. Fair prizes.

{showImage("artwork/merchant_convoy.png")}

* [Ambush them on the road}
    #stat:agility+1
    #triggerCombat:merchant_guards
    Arrows from the ditch, rush from the woods. You take them before they form. The merchants surrender, hand over strongboxes, beg for lives. You honor their surrender. Mostly.
    -> END

* [Follow to their destination - richer targets}
    #stat:wits+2
    #advanceTime:360
    The town they flee to has walls, a garrison, wealthy merchants who'll pay to keep their goods safe. You slip away, report positions. Your knowledge becomes your contribution.
    -> END

* [Parlay - some merchants would sell to anyone}
    #stat:charisma+1
    #stat:wealth+15
    They prefer customers to robbers. Prices favor them, but English silver spends. You acquire goods without violence. The army takes the town eventually anyway.
    -> END

// ============================================
// VILLAGE 10: Abandoned Castle
// ============================================

=== raid_abandoned_castle ===
#speaker:narrator

A minor lord's keep, abandoned decades past when the family failed. Peasants shelter in the bailey, bandits in the towers. Ruin made refuge.

Ancient walls, unstable masonry, hidden cellars. Dangerous ground.

{showImage("artwork/abandoned_castle.png")}

* [Clear and garrison it - strategic point}
    #stat:strength+2
    #stat:patronFavor+3
    #triggerSkirmish:bandit_defenders
    You root out the vermin, repair what you can, hold it for the column. A forward base, a supply cache. Your lord will reward such initiative.
    -> SET

* [Loot the cellars - old nobility had coin}
    ~ temp find = RANDOM(1, 4)
    { find == 1:
        #item:add:ancient_silver
        #stat:wealth+20
        Hidden beneath flagstones, a century's savings. Moldy but precious.
    - find == 2:
        #stat:stress+2
        Nothing but rats and rot. The peasants got here first. Or earlier bandits.
    - find == 3:
        #item:add:haunted_dagger
        A ceremonial blade, cursed probably, definitely haunted. You take it anyway. What's one more ghost?
    - else:
        #stat:reputation+3
        You find documents - land grants, genealogies, proof of English claims. The King values such papers more than silver.
    }
    -> END

* [Leave it - ruins are death traps}
    #stat:wits+1
    Other squads try their luck. One collapses a floor, breaks legs. Another finds bandits ready. You march around, intact. Caution is its own victory.
    -> END

// ============================================
// VILLAGE 11: Cultivated Fields
// ============================================

=== raid_cultivated_fields ===
#speaker:narrator

A village stripped of people, guards taken to Rouen, only the crops remain. Fields golden with grain, orchards heavy with apples, the accumulated labor of a year's growing.

Burn it all, and Normandy starves.

{showImage("artwork/fields_burning.png")}

* [Systematic destruction - military doctrine}
    #addHeat:25
    #stat:patronFavor+5
    You work the fields with torches. Grain, vegetables, orchards. Nothing edible survives. Scorched earth in its purest form. Strategy made cruel.
    -> END

* [Take what you can carry - pragmatism}
    #item:add:grain_sacks:3
    #stat:morale+2
    The rest burns anyway when others pass through. But you fill bellies first. A squad that eats fights better than one that makes political statements.
    -> END
* |Quietly pass through - let someone else commit the crimes]
    #stat:reputation+3
    #stat:stress+2
    You see the fields, know their fate, refuse to be the one who strikes the torch. Your commander won't notice your absence. Your conscience will.
    -> END

// ============================================
// VILLAGE 12: Bridge Town
// ============================================

=== raid_bridge_town ===
#speaker:narrator

A town grown around the only bridge for miles. Stone arches, heavy timber, toll gates. The French garrison is light, the wealth is heavy.

You need that bridge. Or need to deny it to the French.

{showImage("artwork/bridge_town.png")}

* [Hold the bridge - strategic value}
    #stat:wits+2
    #stat:patronFavor+4
    #triggerSkirmish:bridge_garrison
    You rush the guardhouse, kill the few who resist, barricade the spans. English control means French suffering. Your name rises in dispatches.
    -> END

* [Burn the bridge - deny it to the enemy}
    #addHeat:15
    You can't hold it, can't guard the approaches. Fire accomplishes what force cannot. The bridge burns spectacularly. Crossing this river just became everyone's problem.
    -> END

* [Tax the merchants - squeeze the stone}
    #stat:wealth+18
    #stat:charisma-1
    Tolls become taxes, taxes become extortion. You become wealthy, hated, temporary king of a temporary bridge. Eventually the army moves on. So do you.
    -> END

// ============================================
// VILLAGE 13: Granary Village
// ============================================

=== raid_granary_village ===
#speaker:narrator

This village feeds a region. Massive barns store grain from twenty farms. A year's crop under one long roof. The farmer-council meets here, markets here, worships here.

Strike here, and you strike twenty villages.

{showImage("artwork/granary_raid.png")}

* [Burn it all - maximum impact}
    #addHeat:35
    #stat:patronFavor+8
    The granary burns like a cathedral. Fire climbs to heaven. Smoke visible for a day march. The news spreads faster: English here, food destroyed, winter coming.
    -> END

* [Distribute grain to your squad - immediate benefit}
    #stat:morale+3
    #stat:wealth+10
    You take what you need, share among your men. The rest burns eventually. But your squad marches on full bellies, loyal, ready. Loyalty is precious.
    -> END

* [Spare it - let them feed their own}
    #stat:reputation+5
    #stat:patronFavor-3
    The council begs, trades, offers intelligence. You spare their food. They point you to richer targets, help you avoid French patrols. Mercy buys allies. Sometimes.
    -> END

// ============================================
// VILLAGE 14: Quarrier Settlement
// ============================================

=== raid_quarrier_settlement ===
#speaker:narrator

Stonecutters live here. They supply builders, churches, noble houses for leagues around. Their work continues even as war rolls past - stone is patient.

They have coin, buried deep for hard times. They have tools, metal worth stealing. They have pride, which costs men their lives.

{showImage("artwork/quarrier_village.png")}

* [Take their trade - tools are wealth}
    #item:add:stone_tools
    #stat:wealth+12
    Chisels, hammers, measuring rods. English smiths pay well for good Norman steel. The quarriers watch you take their craft with hollow eyes.
    -> END

* [Demand their hidden coin}
    #addHeat:12
    #stat:wealth+15
    You threaten, they fold. Strongboxes emerge from wells, from root cellars, from beneath their sleeping platforms. Everyone hides wealth. Everyone reveals it under sufficient threat.
    -> END

* [Hire the skilled - use them}
    #setflag:quarrier_allies
    #stat:wits+1
    Some come willingly - coin and protection. They can build your works, undermine walls, read stone like you read terrain. Knowledge is ammunition.
    -> END

// ============================================
// VILLAGE 15: Burned Ruins
// ============================================

=== raid_burned_ruins ===
#speaker:narrator

Someone passed here before you. Smoke still rises from charred frames. Bodies in the ditch, picked by crows. Your brothers-at-arms got here first.

Scavengers pick through remains. Fools seeking what fools missed. The dead are still dead.

{showImage("artwork/burned_ruins.png")}

* [Pursue the first raiders - share the blame}
    #advanceTime:120
    Catch them before they reach the column. Claim kinship, take a share of their plunder for "protection." English soldiers do this to each other constantly. It's tradition.
    -> END

* [Salvage what they missed - thorough work}
    ~ temp find = RANDOM(1, 3)
    { find == 1:
        #stat:wealth+5
        Hidden pit beneath the ashes. Coins the first raiders never found. Luck or care, you profit.
    - find == 2:
        #stat:stress+1
        Nothing. Fire and greed have been thorough. You waste time better spent marching.
    - else:
        #item:add:damaged_reliquary
        A melted lump containing pearls, gold leaf, a saint's finger bone. Worthless to honest men. Valuable to the right dealer.
    }
    -> END

* [Bury the dead - someone should}
    #stat:reputation+4
    #stat:stress+2
    They were French. They were people. Someone should mark their end. You pile stones, mumble words. Other soldiers watch, wonder at your softness. You wonder at their hardness.
    -> END
