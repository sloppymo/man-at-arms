// ============================================
// 01_march_events.ink - March Events
// Supply, Comrades, Weather, and Discoveries
// ============================================

EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL addHeat(amount)
EXTERNAL changeStat(stat, delta)
EXTERNAL addItem(itemId, qty)
EXTERNAL discoverHex(q, r)
EXTERNAL triggerSkirmish(type)
EXTERNAL showImage(imagePath)

-> march_event_start

=== march_event_start ===
// Wrapper to randomly select from event categories
~ temp roll = RANDOM(1, 4)
{ roll == 1: -> supply_events }
{ roll == 2: -> comrade_events }
{ roll == 3: -> weather_events }
{ roll == 4: -> discovery_events }
-> END

// ============================================
// SUPPLY EVENTS (5)
// ============================================

=== supply_events ===
~ temp event = RANDOM(1, 5)
{ event == 1: -> supply_food_spoiled }
{ event == 2: -> supply_water_low }
{ event == 3: -> supply_forage_success }
{ event == 4: -> supply_captured_wagon }
{ event == 5: -> supply_rat_damage }
-> END

=== supply_food_spoiled ===
#speaker:narrator
#portrait:none

The salt pork you brought from England has turned. The barrel opens with a stench that makes men gag twenty paces away. Green mold creeps across the meat like foreign territory on a map.

{showImage("artwork/spoiled_food.png")}

The rearguard captain shrugs. "March faster or starve. Your choice."

* [Throw it out and march hungry]
    #consume:food:-3
    #stat:morale-1
    
    You dump the rotten pork in a ditch. Three days' provisions, gone. The men around you watch their own rations more carefully now.
    -> END

* [Scrape off the mold and eat carefully]
    #stat:endurance+1
    #stat:stress+1
    #consume:food:2
    { RANDOM(1, 3) == 1:
        #stat:wealth-10
        You retch for an hour, but keep marching. One of your comrades is not so lucky - he collapses by midday, vomiting bile. You share your water, but he's done for this campaign.
    - else:
        The meat tastes foul, but stays down. Experience: soldiers have eaten worse. Much worse.
    }
    -> END

* [Trade it to desperate men for something]
    #stat:charisma+1
    #stat:wealth+2
    
    You find a peasant boy following the army, eyes hollow with hunger. For a silver penny and the promise of more food, he takes the barrel. You don't ask what he'll do with it. You don't want to know.
    -> END

=== supply_water_low ===
#speaker:narrator

The water skins are light. Too light. The last stream was fouled by dead cattle upstream, bloated and black with summer.

Your mouth tastes like dust. Men are already rationing sips, saving the last for evening or emergency.

{showImage("artwork/thirsty_march.png")}

* [Search ahead for clean water]
    #stat:agility+1
    { RANDOM(1, 4) == 1:
        #triggerSkirmish:patrol
        You find a well in an abandoned farmyard. But French militia spotted you first. Shots ring out from the stone wall!
        -> END
    - else:
        #consume:water:2
        A sunken cistern, half-full, rainwater from last week's storm. You drink your fill and carry what you can. The men cheer when you return - water worth more than silver today.
        -> END
    }

* [Ask your comrades to share]
    #stat:morale+2
    #stat:charisma+1
    { RANDOM(1, 2) == 1:
        #consume:water:1
        "Water brothers," they call it. Those who share now will be remembered. Tom the Welshman gives you half his skin without hesitation. You'll repay him, somehow, someday.
    - else:
        #stat:morale-1
        The looks you get are hollow, calculating. Water is survival. Why should they die for your thirst? You march on, drier than before.
    }
    -> END

* [Sweat less, march slower]
    #advanceTime:60
    #stat:endurance+1
    You set a slower pace, conserve energy, breathe through your nose. The column passes you, but you catch up at the next halt. Water saved is water earned.
    -> END

=== supply_forage_success ===
#speaker:narrator

A farmstead nestles in a hollow, smoke rising from its chimney. The family saw you coming - they're already running for the treeline, bundles bouncing on their backs.

The barn doors hang open. Chickens scatter. A pig roots in the kitchen garden, oblivious.

{showImage("artwork/abandoned_farm.png")}

* [Check the house carefully first]
    #stat:wits+1
    #item:add:preserved_meat
    #item:add:cheese
    
    Smart. There's a trap on the door, a scythe rigged to swing. You disarm it and search methodically. The pantry is loaded - smoked ham, three wheels of cheese, a barrel of cider. Your squad eats well tonight.
    -> END

* [Take the livestock and run]
    #addHeat:5
    #item:add:chicken:3
    #item:add:pig_meat
    
    The pig squeals as you stick it. Chickens flap in canvas sacks. You haul your loot and fall back before the family can return with neighbors. A good haul, hot in your belly tonight.
    -> END

* [Pursue and question the family]
    #triggerSkirmish:resistance
    #addHeat:8
    You catch the old man limping toward the woods. He won't talk at first, but you have methods. The nearest town has militia forming. The roads are watched. Valuable intelligence, bought with pain.
    -> END

=== supply_captured_wagon ===
#speaker:narrator

A merchant wagon lies overturned in the ditch, wheels spinning. French countryside commerce, interrupted. Goods spilled across the road - bolts of cloth, casks of wine, a locked strongbox.

The driver's body is twenty yards on, arrows in his back. English work, probably this morning.

{showImage("artwork/raided_wagon.png")}

* [Open the strongbox]
    ~ temp roll = RANDOM(1, 6)
    { roll > 4:
        #stat:wealth+25
        #item:add:fine_cloth
        The lock breaks with a prybar. Silver coins, dozens of livres, a churchman's donation box perhaps. You pocket what you can before others arrive.
    - else:
        #stat:stress+1
        Locked tight. You hammer at it while time passes, too long. A patrol appears on the ridge. You flee empty-handed, cursing your luck.
    }
    -> END

* [Take the wine]
    #item:add:wine_cask
    #stat:morale+2
    #stat:stress-1
    The wine is good, probably worth taking intact. You roll the cask onto a cart and mark it for later. Tonight, if you're still alive, you'll drink like a lord.
    -> END

* [Leave it - bad luck to rob the dead]
    #stat:reputation+2
    #stat:stress-1
    Superstition, perhaps, but soldiers have their omens. You pass by, content with what the army provides. The next man will take it. That is not your concern.
    -> END

=== supply_rat_damage ===
#speaker:narrator

Camp rats. Fat, bold, fearless. They've chewed through your spare boots, your jerkin, the leather straps of your armor. Everything organic is at risk.

You wake to movement in your pack. Tiny eyes gleam in firelight.

* [Set traps and catch them for eating]
    #stat:agility+1
    #item:add:rat_meat
    
    String, bait, patience. You trap three before midnight, snapping their necks with practiced hands. "Roof rabbit," the old soldiers call it. Stringy, gamy, but full of desperate protein.
    -> END

* [Poison them with spoiled meat]
    #stat:wits+1
    #conume:food:-1
    You lace scraps with bile from the spoiled pork. Tomorrow you'll find them dead, bloated. The survivors have learned or fled. Either way, less trouble.
    -> END

* [Seal your gear better and accept the loss]
    #stat:endurance+1
    #stat:wealth-5
    Repair, wrap, hang from branches. You learn. Rats teach hard lessons. Your boots are ruined, but your food survives the night.
    -> END

// ============================================
// WEATHER EVENTS (5)
// ============================================

=== weather_events ===
~ temp event = RANDOM(1, 5)
{ event == 1: -> weather_mud }
{ event == 2: -> weather_heat }
{ event == 3: -> weather_rain }
{ event == 4: -> weather_fog }
{ event == 5: -> weather_clear }
-> END

=== weather_mud ===
#speaker:narrator

The road has vanished. In its place: a sucking morass of Normandy clay, thigh-deep in places, treacherous everywhere. Horses flounder. Men slip, lose boots, abandon carts.

Your squad marches in file, testing each step, extracting feet with wet sounds of protest.

{showImage("artwork/mud_march.png")}

* [Help pull a stuck wagon]
    #stat:strength+2
    #stat:endurance+1
    Heave, slip, curse, heave again. The wagon frees with a sound like a dying giant. The quartermaster remembers your name. Useful, that.
    -> END

* [Strip to essentials and wade light}
    #stat:agility+1
    #stat:endurance-1
    You shed armor, coat, pack. March with what you can carry, return for the rest. The mud claims half your spare kit, swallowed whole. Survival costs.
    -> END

* [Find a drier route through the fields}
    #stat:wits+1
    { RANDOM(1, 3) == 1:
        #triggerSkirmish:patrol
        The hedgerow path looks dry. It's also an ambush site. French peasants with bows, waiting for stragglers. You find them before they find you. Dirty work follows.
    - else:
        #advanceTime:120
        You lose an hour but save your boots. The column forges ahead; you'll catch up at evening camp. Sometimes slow is fast.
    }
    -> END

=== weather_heat ===
#speaker:narrator

The sun blazes mercilessly. Armor becomes an oven. Sweat runs in rivers, evaporates before it can cool. Men drop, heat-struck, babbling of English streams and their mothers' shade.

Your helm weighs like a cursed crown. Each step is an act of will.

{showImage("artwork/heat_march.png")}

* [Strip armor to minimum]
    #stat:stress-1
    #stat:agility+1
    Mail vest only, no helmet, sleeves rolled. If the French attack, you'll die prettier. But you'll reach evening still breathing.
    -> END

* [Share your water - leadership costs}
    #stat:morale+2
    #stat:charisma+1
    #consume:water:-1
    The Welshman is worse off than most. You pour half your ration down his throat. He lives. He remembers. Men notice these things.
    -> END

* [Rest in shade, fall behind}
    #stat:endurance+1
    #advanceTime:90
    A copse of trees offers salvation. Two hours' rest, legs elevated, wet cloth on neck. You rejoin the column at dusk. Alive. That's the important part.
    -> END

=== weather_rain ===
#speaker:narrator

The heavens open. Not English rain, polite and brief. Norman rain, biblical and endless, as if God himself weeps for French suffering. Or laughs at English misery.

Water finds every gap. Your bowstring stretches. Your powder-if you had any-is ruined.

{showImage("artwork/rain_march.png")}

* [March through it - get it over with}
    #stat:endurance+2
    #stat:stress+1
    Misery now means dry clothes sooner. You push the pace, shivering, soaked, cursing in three languages. By evening, you're beyond feeling. Numb is its own blessing.
    -> END

* [Shed metal - rust kills gear}
    #stat:wealth-5
    You strip weapons, oil them, wrap them in oiled cloth. Hours of careful work under a dripping tarp. Your sword will bite tomorrow when others' snap or jam.
    -> END

* [Seek shelter in a barn}
    #addHeat:3
    { RANDOM(1, 3) == 1:
        #stat:morale+2
        The farmer fled; his barn stands empty. You huddle with your squad, share body heat, dry socks by small fire. Civilization survives in small moments.
    - else:
        #triggerSkirmish:resistance
        #addHeat:5
        The farmer stayed. So did his sons. And their bows. You clear the barn with steel and fire. Not your proudest hour.
    }
    -> END

=== weather_fog ===
#speaker:narrator

Morning fog rolls in from the coast, thick as wool, white as death. You can barely see the man in front of you. The army dissolves into disconnected groups, stumbling blind.

Sound is muffled. Direction uncertain. In this mist, anything could be waiting.

{showImage("artwork/fog_march.png")}

* [Stick close to your squad}
    #stat:morale+1
    Bellies touching, knives out, you move as one organism. If death comes, it comes for all of you. Small comfort, but comfort enough.
    -> END

* [Use the fog to forage ahead}
    #stat:agility+1
    #stat:wits+1
    { RANDOM(1, 4) == 1:
        #triggerSkirmish:patrol
        Silent movement, ghost walking. You find a French outpost before they find you. Kills in the fog leave no witnesses. But each corpse is one more secret burning your soul.
    - else:
        #item:add:forage:2
        You return with mushrooms, berries, a rabbit snared in the blindness. Fresh food. Fresh hope. The fog lifts as you rejoin your squad.
    }
    -> END

* [Halt and wait for clear skies}
    #advanceTime:180
    #stat:stress-1
    The captain agrees - marching blind is marching to doom. You make cold camp, wait. By noon, the fog burns away, revealing a countryside you almost walked into unprepared. Patience saves lives.
    -> END

=== weather_clear ===
#speaker:narrator

A rare perfect day. Sun warm but not cruel, breeze fresh from the sea, roads firm underfoot. Even the Norman landscape looks almost pretty - rolling hills, stone villages, orchards heavy with late summer fruit.

For a few hours, you almost forget why you're here.

{showImage("artwork/beautiful_day.png")}

* [March hard while conditions permit}
    #advanceTime:-60
    #stat:endurance+1
    Make miles while God allows. You push the pace, eat on the march, rest only when the sun demands. By evening, you're leagues ahead of your planned position. Good. Good.
    -> END

* [Forage the orchards - fruit is precious}
    #item:add:fruit:3
    #stat:morale+2
    Apples, pears, plums. The Norman sun grew them for French throats; English mouths taste just as sweet. You fill your pack, share with friends, throw the rotten ones at enemies.
    -> END

* [Take a moment - this may be your last good day}
    #stat:stress-2
    You sit by a stream, boots off, feet in cold water. Watch clouds form and dissolve. Remember home. Remember peace. Store this beauty against the horrors to come.
    -> END

// ============================================
// DISCOVERY EVENTS (5)
// ============================================

=== discovery_events ===
~ temp event = RANDOM(1, 5)
{ event == 1: -> discovery_church }
{ event == 2: -> discovery_hermit }
{ event == 3: -> discovery_refugees }
{ event == 4: -> discovery_dead_soldier }
{ event == 5: -> discovery_warning }
-> END

=== discovery_church ===
#speaker:narrator

An abandoned church stands where two roads cross. Door broken, birds nesting in the rafters, but the stone walls still offer shelter. The altar cloth is fine linen, worth taking. The crucifix is iron, heavy, valuable.

God watches, perhaps. God has watched worse.

{showImage("artwork/abandoned_church.png")}

* [Take the altar cloth - it's just cloth}
    #item:add:fine_linen
    #stat:wealth+8
    God doesn't need fine weave. You need silver. Trade is trade, even with churches.
    -> END

* [Loot the poor box - silver is silver}
    #stat:wealth+5
    #addHeat:2
    #stat:stress+1
    The box is locked but not well. A few pence, some charity for the poor who won't receive it. God forgives soldiers. You hope.
    -> END

* [Pray briefly - you're not completely damned}
    #stat:stress-2
    #stat:reputation+1
    You kneel on the cold stone, mumble words half-remembered from childhood. No priest hears your confession, but the silence holds a weight. Perhaps enough.
    -> END

=== discovery_hermit ===
#speaker:narrator

A hermit lives in the woods, older than sin, mad as March hare. He prophecies doom for all - French, English, the mad king across the water. The plague comes, he says. The end times.

His eyes are clear, though. Clear as mountain water.

{showImage("artwork/hermit.png")}

* [Ask practical questions - roads, patrols}
    #stat:wits+1
    Madness sees clearly sometimes. He knows the land, the hidden paths, where French militia camps. You leave him bread; he gives you knowledge. Fair trade.
    -> END

* [Listen to his prophecy - soldiers need omens}
    ~ temp omen = RANDOM(1, 3)
    { omen == 1:
        #stat:luck+1
        "The crow that walks backwards sees truth." Nonsense, probably. But you watch for crows now, walking any direction.
    - omen == 2:
        #stat:stress+1
        "Death rides a pale horse, and his name is your commander's." You sleep uneasy that night.
    - else:
        #stat:morale+1
        "Victory to the bold, but only if the bold know when to run." Wise words, whatever their source.
    }
    -> END

* [Take his food and be gone - madness wastes time}
    #item:add:dried_fish
    #stat:reputation-2
    He fights, weak and ancient. You take what little he has and leave him to starve. Easier than choices. Easier than conscience.
    -> END

=== discovery_refugees ===
#speaker:narrator

A column of refugees blocks the road - old women, children, men carrying what possessions they can manage. French peasants, fleeing before the English scourge. You are the monster in their nightmare made flesh.

They see you and freeze. Some weep. Some pray. Some just stare, hollow-eyed, already dead inside.

{showImage("artwork/refugees.png")}

* [Let them pass - they're no threat}
    #stat:reputation+3
    #stat:patronFavor-1
    You wave them on, rough but not cruel. They flow around you like water around stone, grateful, terrified. Your commander might not approve. You don't care.
    -> END

* [Question them - where are the French troops?}
    #stat:wits+1
    Threats loosen tongues. They know little - rumors of knights gathering at Rouen, militia drilling in villages. Enough. Intelligence is ammunition.
    -> END

* [Take what they carry - they're just going to lose it}
    #stat:wealth+6
    #addHeat:4
    #stat:stress+2
    You strip them like apple trees in autumn. Jewelry, coin, good boots, the necklace the grandmother wore to her wedding. Their curses follow you down the road. Deserved curses.
    -> END

=== discovery_dead_soldier ===
#speaker:narrator

A body in English colors, two days dead, bloated with summer heat. His squad left him behind, looted him already, moved on. One of yours. One of the thousand who won't reach Calais.

Flies rise in clouds. The stench is remarkable.

{showImage("artwork/dead_soldier.png")}

* [Search him properly - squads miss things}
    ~ temp find = RANDOM(1, 4)
    { find == 1:
        #item:add:french_coin_purse
        #stat:wealth+12
        Hidden in his boot. Clever man. His cleverness helps you now.
    - find == 2:
        #item:add:letter_home
        A letter, half-written, to someone named Alice. You burn it. Unfinished business dies with the dead.
    - find == 3:
        #stat:stress+1
        Nothing. Someone was thorough. You close his eyes, what little honor remains.
    - else:
        #item:add:rusty_dagger
        A poniard, good steel under surface rust. Clean it, sharpen it, worth a few pence in Calais.
    }
    -> END

* [Take his boots - yours are worn}
    #item:add:boots_military
    He doesn't need them. Dead men's boots walk for the living. Somewhere, his mother prays for the soul of whoever wears them. You send a silent apology to mothers everywhere.
    -> END

* [Drag him off the road - give him that dignity}
    #stat:reputation+2
    #stat:stress+1
    Heavy work in the heat. You haul him into a ditch, pile stones against scavengers. Tomorrow's column will see the cairn, know a soldier had at least one friend.
    -> END

=== discovery_warning ===
#speaker:narrator

A sign, crude and recent, nailed to an oak: SKULL AND CROSSBONES. Below it, French words you can't read. The meaning is clear enough. Danger ahead. Death waiting.

Who posted it? French militia? Local resistance? A warning to their own people to avoid the road?

{showImage("artwork/warning_sign.png")}

* [Heed the warning - find another route}
    #stat:wits+1
    #advanceTime:120
    You lead your squad around, through fields, losing time but maybe saving throats. Caution has its own reward. You reach camp at dusk, tired but whole.
    -> END

* [Proceed cautiously - eyes open, weapons ready}
    { RANDOM(1, 3) == 1:
        #triggerSkirmish:ambush
        You were right to worry. Archers in the treeline, waiting for English fools. You spot them just in time. The fight is sharp, brief, deadly.
    - else:
        #stat:wits+1
        Paranoia preserves. You see nothing, fight nothing. Perhaps the warning was old. Perhaps your caution scared them off. Either way, you march on.
    }
    -> END

* [Laugh and tear it down - English lions fear no warnings}
    #stat:strength+1
    #stat:morale+2
    You rip the sign from the tree, burn it as signal fire. Let them watch and know: Edward's army fears nothing. Pride before the fall, perhaps. But glorious pride.
    -> END

// ============================================
// COMRADE EVENTS (5)
// ============================================

=== comrade_events ===
~ temp event = RANDOM(1, 5)
{ event == 1: -> comrade_desertion }
{ event == 2: -> comrade_death }
{ event == 3: -> comrade_camaraderie }
{ event == 4: -> comrade_quarrel }
{ event == 5: -> comrade_gambler }
-> END

=== comrade_desertion ===
#speaker:narrator

Tom the Welshman is gone. His blanket folded, his spot empty by the cold fire. Desertion in the night, with half the campaign pay he was owed and a canteen of water.

Men pretend not to notice. Desertion is contagious. Fear spreads like plague.

{showImage("artwork/empty_bedroll.png")}

* [Pursue him yourself]
    #stat:agility+2
    { RANDOM(1, 3) == 1:
        #stat:reputation+3
        You find him by noon, limping with a twisted ankle. He begs. You march him back in shame. The captain gives you his coin and his gear. Justice, of a kind.
    - else:
        #advanceTime:180
        Tracks fade. Tom was always woodcrafty. He's in the hills now, hiding, hungry. You return to report failure. The men look at you differently. Soft, some whisper.
    }
    -> END

* [Report him to the captain]
    #stat:patronFavor+1
    #stat:reputation-1
    The captain marks his name. If Tom is caught, it's the rope. If not, his family loses his pay. You did your duty, as much as duty asks.
    -> END

* [Keep his secret]
    #stat:charisma+1
    #stat:stress+1
    Tom helped you at Harfleur when you were sick. Debt paid. You say nothing, let the men wonder. Tom's ghost walks with you now, watching, grateful.
    -> END

=== comrade_death ===
#speaker:narrator

A cart passes bearing the dead. Today's: John the smith, arrow through his throat during the morning's skirmish. Three days' acquaintance. He showed you how to mend a broken strap.

Now he's meat for the grave diggers, coin for the crows.

{showImage("artwork/death_cart.png")}

* [Take his boots - he doesn't need them]
    #stat:wealth+3
    #stat:stress+1
    Pragmatism. The boots fit. John was practical; he'd understand. The other men watch you, calculating. Who's next? Whose boots?
    -> END

* [Say a prayer over him]
    #stat:reputation+2
    #stat:morale+1
    Words cost nothing. You know the Latin, mumble it like you mean it. Other men join in. John didn't go unblessed into the ground. It's something.
    -> END

* [Ask what happened - learn from his mistake}
    #stat:wits+1
    #stat:experience+1
    The archer saw it. John charged ahead, shield low, chasing a wounded Frenchman into a gully埋伏. Pride killed him. Pride kills everyone, eventually.
    -> END

=== comrade_camaraderie ===
#speaker:narrator

Night camp. Someone has a lute, battered but playable. Voices rise in song - English songs, Welsh ballads, drinking rounds that make no sense to sober men.

You find yourself singing too, voice raw, heart lighter than it has any right to be.

{showImage("artwork/camp_song.png")}

* [Share your remaining wine]
    #item:remove:wine_cask
    #stat:morale+3
    #stat:charisma+2
    
    The cask empties fast. Men remember generosity. Tomorrow you'll march together, bound by tonight's goodwill. Small comfort, but comfort matters.
    -> END

* [Teach your favorite song}
    #stat:charisma+1
    #stat:morale+2
    A northern dirge, slow and sad, about lovers parted by war. Men quiet to listen. Even soldiers feel homesick.
    -> END

* [Keep to yourself - rest while you can}
    #stat:stress-1
    #stat:endurance+1
    The songs are a trap. Happiness before battle breeds despair. You curl in your cloak, feign sleep, plan tomorrow. Let others have their moments.
    -> END

=== comrade_quarrel ===
#speaker:narrator

Two men circle each other at the camp's edge, knives out, voices raised over dice or a woman or some imagined slight from a month ago.

A crowd gathers. Blood in the air, like dogs scenting meat.

{showImage("artwork/camp_quarrel.png")}

* [Intervene and break it up]
    #stat:strength+1
    { RANDOM(1, 2) == 1:
        #stat:reputation+3
        You step between them, hands raised, voice commanding. They back down, shame-faced. The camp sees. You have stature now, presence.
    - else:
        #stat:stress+2
        One turns on you. You fight too, three men brawling until others drag you apart. Bruises, cuts, but no deaths. Small blessings.
    }
    -> END

* [Let them fight - entertainment is scarce}
    #stat:wits-1
    They cut each other, badly. One dies by morning, fevered. The other marches with a limp and a guilt he'll carry to Calais. You watched. You did nothing.
    -> END

* [Bet on the outcome}
    #stat:wealth+5
    { RANDOM(1, 2) == 1:
        You judge right - the bigger man tires, the smaller guts him. You collect your winnings and buy meat from the victor's coin. War economics.
    - else:
        #stat:wealth-3
        Wrong. The smaller man had heart but no blade-work. You lose your stake and a day's goodwill to the winner's friends.
    }
    -> END

=== comrade_gambler ===
#speaker:narrator

Roger the dice-man finds you at fireside. His dice are bone, worn smooth, probably honest enough for soldiers.

"Three throws," he offers. "Fair odds. Winner takes the pot."

His canvas bag holds coins from a dozen men, maybe yours among them.

* [Play a round - small stakes]
    ~ temp roll = RANDOM(1, 6)
    { roll > 3:
        #stat:wealth+3
        Your hand is steady, the dice true. Roger frowns, pays out, invites another round. No.
    - else:
        #stat:wealth-2
        #stat:stress+1
        The dice hate you tonight. Roger smiles, pockets your coin, moves to the next mark. You'll remember this.
    }
    -> END

* [Accuse him of loaded dice}
    #stat:reputation+2
    #addHeat:3
    { RANDOM(1, 3) == 1:
        #stat:wealth+5
        A fight erupts. The camp divides. Roger's dice are examined, debated, declared fair enough. But his reputation shatters. Men won't play him, won't trust him. His wealth comes easier. You cost him that.
    - else:
        #stat:reputation-2
        Roger calls for witnesses. Men remember seeing their own bad throws, their own losses. They blame you for sour luck, not him for sharp skill. You back down, shamed.
    }
    -> END

* [Refuse politely - gambling's a fool's game}
    #stat:wits+1
    #stat:morale+1
    Other men play, win and lose. You watch, learn faces, remember names. Tonight's entertainment is tomorrow's intelligence. Who has money, who has debts, who might trade favors.
    -> END
