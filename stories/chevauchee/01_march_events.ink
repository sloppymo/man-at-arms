EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)
EXTERNAL removeItem(itemId, quantity)
EXTERNAL hasItem(itemId)
EXTERNAL addHeat(amount)
EXTERNAL changeStat(stat, delta)
EXTERNAL discoverHex(q, r)
EXTERNAL rollDice(modifier)
EXTERNAL doCheck(stat, difficulty, bonus)

== start
=== march_event_1
{showImage("artwork/standoff.jpg")}

The column marches through a dense forest, the trees closing in overhead. The air is thick with the smell of pine and damp earth. Suddenly, a deer bursts from the undergrowth and bounds across your path.

{advanceTime(15)}

Several archers raise their bows instinctively, but Sir Robert holds up a hand. "Let it go. We're not hunting today."

* "We could use the fresh meat."
  "True, but the time it would take to dress and cook it would slow us down," Sir Robert explains. "We move fast and light. That's our advantage."

  {advanceTime(10)}
  -> DONE

* "Good call. Speed is more important."
  Sir Robert nods. "Exactly. The French will be expecting us to stop and hunt, to forage, to act like a normal army. We don't."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

* "I could have taken that shot."
  "I'm sure you could," Sir Robert says with a slight smile. "But discipline wins wars, not individual glory. Save your arrows for Frenchmen."

  {advanceTime(10)}
  -> DONE

* [Shoot the deer anyway]
  You ignore the command and draw your bow in one fluid motion. The arrow flies true, striking the deer in the flank. It staggers, blood spraying, then crashes into the underbrush.

  The column falls silent. Sir Robert turns to you, his face like stone. "You disobeyed a direct order. In war, that gets men killed."

  The men look away uncomfortably. One of your comrades mutters, "Fresh meat's fresh meat."

  {changeStat("stress", 3)}
  {addHeat(2)}
  {advanceTime(30)}
  -> DONE

* [Signal the men to stand down]
  You raise your hand alongside Sir Robert's, reinforcing his command. The archers lower their bows, and the deer disappears into the forest unharmed.

  Sir Robert gives you a brief nod of approval. "Good man. Discipline above all."

  {changeStat("leadership", 1)}
  {changeStat("stress", -1)}
  {advanceTime(5)}
  -> DONE

=== march_event_2
You come across a small stream, crystal clear and babbling over smooth stones. The men are thirsty from the long march, and several start to kneel to drink.

{advanceTime(5)}

"Wait!" Sir Robert commands sharply. "Let the horses drink first, then fill our waterskins. Don't drink from the stream directly."

* "Why not? The water looks clean."
  "Looks can be deceiving," the veteran knight explains. "There could be dead animals upstream, or worse, the French could have poisoned it."

  {advanceTime(10)}
  -> DONE

* "Good thinking. Better safe than sorry."
  "In enemy territory, caution keeps you alive," Sir Robert agrees. "The French know this land better than we do."

  {changeStat("stress", -1)}
  {advanceTime(15)}
  -> DONE

* "I'll check upstream for any signs of trouble."
  Sir Robert nods approval. "Take two men. If you find anything suspicious, come back immediately. Don't engage."

  {changeStat("stress", 1)}
  {advanceTime(20)}
  -> DONE

=== march_event_3
The army passes through an abandoned village. The houses are burned, the fields trampled, and several bodies lie unburied. This is the work of another chevauchée - French, English, or perhaps mercenaries.

{advanceTime(20)}

{addHeat(1)}

The men look grimly at the destruction. This could be their own villages in a few weeks.

* "Who did this?"
  "Hard to say," Sir Robert says, kicking at a broken sword half-buried in the mud. "Could have been us last month, could be the French last week. In war, it all looks the same."

  {advanceTime(10)}
  -> DONE

* "Should we bury the dead?"
  "No time," Sir Robert says firmly. "And they might not be French. Best we leave them be. We have our own mission to complete."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

* "This is what we're doing to other villages."
  "It is," Sir Robert agrees, his voice hard. "War is hell. Remember this when you're tempted to be merciful. Mercy here might mean cruelty to our own people back home."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

=== march_event_4
A thick fog rolls in, reducing visibility to just a few dozen yards. The column slows to a crawl, men staying close to their comrades.

{advanceTime(30)}

"Sound off!" Sir Robert calls. "I want every man accounted for!"

* "This is perfect for ambush."
  "Exactly why we're being careful," Sir Robert replies. "The French love fighting in fog. They know the terrain, we don't."

  {addHeat(1)}
  {advanceTime(10)}
  -> DONE

* "Should we make camp and wait for it to lift?"
  "No, that gives them time to gather forces," Sir Robert decides. "We'll keep moving, but slowly. Archers to the flanks, listen for any movement."

  {advanceTime(15)}
  -> DONE

* "I can barely see the man next to me."
  "Stay close and keep your hand on your weapon," Sir Robert advises. "If we're attacked, form a defensive circle immediately."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> DONE

=== march_event_5
You crest a hill and see a magnificent castle in the distance - walls of white stone, tall towers, banners flying. It's too strong to attack, but an impressive sight.

{advanceTime(15)}

{addHeat(2)}

The men pause to stare at it. That's the kind of place that could make a man rich - if he could take it.

* "What castle is that?"
  "Château Gaillard," Sir Robert says with a mix of admiration and frustration. "Richard the Lionheart's masterpiece. Impenetrable, unfortunately."

  {advanceTime(10)}
  -> DONE

* "Think they've spotted us?"
  "Almost certainly," Sir Robert nods. "Look - you can see riders coming from the gates. They'll have scouts tracking us within the hour."

  {addHeat(3)}
  {advanceTime(10)}
  -> DONE

* "We should stay clear of that."
  "Definitely," Sir Robert agrees. "We'll swing east and avoid their patrol routes. No point picking a fight we can't win."

  {advanceTime(15)}
  -> DONE

=== march_event_6
The column passes through fields of ripe wheat, golden in the sun. The farmers who worked these fields fled days ago, leaving their harvest ready for the taking.

{advanceTime(20)}

{addHeat(1)}

* "We should take the wheat."
  "No time to harvest it properly," Sir Robert decides. "But we can take what we can carry. Each man grab a sheaf - it's better than nothing."

  {advanceTime(15)}
  -> DONE

* "The French will starve this winter."
  "That's the idea," Sir Robert says grimly. "War isn't just about battles. It's about destroying the enemy's ability to fight."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

* "This feels wrong."
  "Doesn't matter what it feels like," Sir Robert says sharply. "This is our duty. The French would do the same to us, and worse."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

=== march_event_7
A sudden thunderstorm rolls in, drenching the column within minutes. The men hunch under their cloaks, but the rain is relentless.

{advanceTime(45)}

The road turns to mud, making the march difficult and slow. Morale drops as quickly as the rain.

* "Should we find shelter?"
  "No natural shelter big enough for 500 men," Sir Robert shouts over the rain. "Keep moving! The rain will wash away our tracks!"

  {advanceTime(20)}
  -> DONE

* "Our powder will be ruined."
  "English longbows work in any weather," Sir Robert reminds you. "That's our advantage. French crossbows would be useless in this."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

* "I'm soaked through."
  "We all are," Sir Robert says grimly. "But the French will be staying indoors today. We're still making progress while they're staying dry."

  {advanceTime(15)}
  -> DONE

=== march_event_8
You come across a small shrine by the roadside - a statue of the Virgin Mary, flowers still fresh at her feet. Some of the men cross themselves automatically.

{advanceTime(10)}

* "Should we leave an offering?"
  Sir Robert shakes his head. "We're here to destroy, not to worship. Leave it be."

  {advanceTime(5)}
  -> DONE

* "This feels like a bad omen."
  "Superstition won't keep you alive," Sir Robert says harshly. "Keep your mind on the mission and your eyes on the horizon."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> DONE

* "Maybe God is on our side after all."
  "God helps those who help themselves," Sir Robert replies. "And right now, we're helping ourselves to French wealth."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

=== march_event_9
The column passes through a vineyard, the grapes heavy on the vines. Some men can't resist and start eating the fruit.

{advanceTime(15)}

"Stop that!" Sir Robert roars. "That's French wine you're drinking!"

* "But they're just grapes."
  "And those grapes will become French wine, which means French money, which means French soldiers," Sir Robert explains. "Destroy the vines!"

  {addHeat(2)}
  {advanceTime(20)}
  -> DONE

* "We could use the wine."
  "We don't have time to make wine, and we can't carry enough to matter," Sir Robert decides. "Burn the vines. Deny them the harvest."

  {advanceTime(15)}
  -> DONE

* "This seems excessive."
  "This is war," Sir Robert says coldly. "Total war. We destroy everything that can help the French war effort."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

=== march_event_10
A group of refugees blocks the road ahead - women, children, and old men, fleeing from your advance. They look terrified.

{advanceTime(10)}

{addHeat(1)}

* "Let them pass."
  Sir Robert nods. "Let them go. They're no threat to us, and killing them serves no purpose."

  {advanceTime(15)}
  -> DONE

* "They might warn other villages."
  "Let them," Sir Robert says with a grim smile. "Terror is a weapon. The more they fear us, the easier our job becomes."

  {addHeat(2)}
  {advanceTime(10)}
  -> DONE

* "We should take their supplies."
  "They have nothing worth taking," Sir Robert says dismissively. "Let them go. We have bigger targets in mind."

  {advanceTime(10)}
  -> DONE

=== march_event_11
The army encounters a herd of cattle grazing in a meadow. The animals are fat and healthy - valuable wealth for someone.

{advanceTime(15)}

* "We should drive them with us."
  "Too slow," Sir Robert decides. "But we can slaughter a few for fresh meat. The rest we'll drive off so the French can't find them."

  {advanceTime(30)}
  -> DONE

* "Who do they belong to?"
  "Probably some monastery or nobleman," Sir Robert shrugs. "Either way, they're enemy property now."

  {addHeat(1)}
  {advanceTime(10)}
  -> DONE

* "This will really hurt the local economy."
  "Good," Sir Robert says simply. "That's the whole point of a chevauchée."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> DONE

=== march_event_12
You pass a gibbet with two bodies hanging from it. They wear English uniforms - deserters or stragglers caught by the French.

{advanceTime(10)}

The men look away quickly. That could be any of them.

* "We should cut them down."
  "No time," Sir Robert says harshly. "And they're dead anyway. Leave them be as a warning to others."

  {advanceTime(5)}
  -> DONE

* "The French don't take prisoners."
  "Not always," Sir Robert agrees. "Which is why we need to be ruthless. Mercy can be fatal in this kind of war."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

* "I wonder what they did."
  "Doesn't matter," Sir Robert says. "They got caught. That's all that matters."

  {advanceTime(5)}
  -> DONE

=== march_event_13
The column comes across a small bridge spanning a river. It looks old but sturdy. However, there are signs that others have crossed recently - fresh tracks in the mud.

{advanceTime(15)}

* "Could be an ambush."
  "Possibly," Sir Robert nods. "Send scouts ahead. I want to know what's on the other side before we cross."

  {advanceTime(20)}
  -> DONE

* "We should find another crossing."
  "The next bridge is miles away," Sir Robert says. "We'll cross, but carefully. Archers first, then the main column."

  {advanceTime(15)}
  -> DONE

* "If there was an ambush, they'd have sprung it by now."
  "Not necessarily," Sir Robert cautions. "They might be waiting for the right moment - when most of us are on the bridge."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> DONE

=== march_event_14
A group of French peasants approaches the column, their hands raised. They want to surrender their village and pay tribute to avoid being destroyed.

{advanceTime(20)}

{addHeat(1)}

* "Accept their surrender."
  Sir Robert considers it. "How much can they pay?" he asks their spokesman.

  {advanceTime(15)}
  -> DONE

* "Take everything and burn it anyway."
  "No," Sir Robert decides. "A village that surrenders peacefully is more valuable than one that resists. It encourages others to do the same."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

* "This is too easy."
  "Sometimes it is," Sir Robert agrees. "But be wary - it could be a trap. Keep your weapons ready."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> DONE

=== march_event_15
The army marches through a forest when suddenly a horn sounds in the distance. French horns - the call to arms.

{advanceTime(5)}

{addHeat(3)}

Instantly, the column tenses. Men draw weapons, archers nock arrows.

* "Form defensive positions!"
  "Not yet," Sir Robert says calmly. "They're still far away. But we should pick up the pace. They know we're here."

  {advanceTime(10)}
  -> DONE

* "How many do you think there are?"
  "Hard to say from one horn," Sir Robert admits. "Could be a patrol, could be an army. We'll assume the worst and move accordingly."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

* "Should we engage?"
  "Only if we have to," Sir Robert decides. "Our mission is raiding, not fighting set-piece battles. Avoid them if possible."

  {advanceTime(15)}
  -> DONE

=== march_event_16
You come across a mill by a stream, still operating. The miller comes out, his face pale with fear, holding out a bag of flour as tribute.

{advanceTime(15)}

* "Take the flour and spare the mill."
  "Good thinking," Sir Robert agrees. "A working mill is more valuable to us than a destroyed one - we can come back for more flour later."

  {advanceTime(10)}
  -> DONE

* "Burn it. Mills support the enemy war effort."
  "True," Sir Robert considers. "But a cooperative miller might be more valuable in the long run. We'll spare it for now."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> DONE

* "How much flour can he produce?"
  "Enough to feed several villages," Sir Robert estimates. "Which means enough to feed several French companies. We'll keep an eye on this place."

  {advanceTime(15)}
  -> DONE

=== march_event_17
The column passes through an area where the forest has been recently cleared - stumps, charred ground, and the smell of smoke still in the air. Another army has been here recently.

{advanceTime(15)}

{addHeat(1)}

* "Who did this?"
  "French, probably," Sir Robert says. "Clearing fields of fire, denying cover to enemies. Standard military engineering."

  {advanceTime(10)}
  -> DONE

* "Are we getting close to a French base?"
  "Possibly," Sir Robert nods. "We need to be more careful from here on. They're definitely active in this area."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> DONE

* "This gives us better visibility."
  "It gives everyone better visibility," Sir Robert cautions. "They can see us coming from miles away now."

  {advanceTime(10)}
  -> DONE

=== march_event_18
A group of English stragglers is spotted ahead - deserters from another chevauchée, trying to make their way back to the coast. They look half-starved and terrified.

{advanceTime(15)}

* "We should take them with us."
  "No," Sir Robert decides harshly. "They're deserters. They abandoned their duty. They're on their own."

  {advanceTime(10)}
  -> DONE

* "What happened to their unit?"
  "Probably got caught by French patrols," Sir Robert guesses. "A few men alone in enemy territory don't last long."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

* "Should we execute them for desertion?"
  "Not our place," Sir Robert says. "And we don't have time. Let them go. The French will probably catch them anyway."

  {advanceTime(10)}
  -> DONE

=== march_event_19
The army encounters a fortified manor house - too strong to take quickly, but potentially wealthy. The gates are closed, and you can see armed men on the walls.

{advanceTime(20)}

{addHeat(2)}

* "We should besiege it."
  "No time for sieges," Sir Robert decides. "We're raiders, not besiegers. Move on."

  {advanceTime(10)}
  -> DONE

* "They might have valuable hostages."
  "Might, but we can't get to them without a proper siege," Sir Robert says. "Not worth the effort or risk."

  {advanceTime(10)}
  -> DONE

* "Should we burn the surrounding farms?"
  "Definitely," Sir Robert nods. "We can't take the manor, but we can destroy its economic base. Burn everything around it."

  {addHeat(3)}
  {advanceTime(20)}
  -> DONE

=== march_event_20
As evening approaches, you spot smoke rising from several directions ahead. Multiple villages are burning - French forces burning their own countryside to deny you supplies.

{advanceTime(15)}

{addHeat(4)}

* "They're using scorched earth tactics."
  "Clever," Sir Robert admits grudgingly. "Deny us forage, force us to either starve or retreat."

  {advanceTime(10)}
  -> DONE

* "This changes everything."
  "It does," Sir Robert agrees. "We'll have to live entirely off our supplies now, and move faster before they can organize proper resistance."

  {changeStat("stress", 2)}
  {advanceTime(10)}
  -> DONE

* "We should turn back."
  "Not yet," Sir Robert decides. "But we need to find targets quickly, before they can coordinate their defenses. The clock is ticking."

  {advanceTime(15)}
  -> DONE

== DONE
{advanceTime(60)}

The march continues, each mile bringing new challenges and decisions. The Norman countryside is both beautiful and dangerous, every hill potentially hiding enemies, every village either a target or a threat.

{addHeat(1)}
{changeStat("stress", 1)}

This is the reality of the chevauchée - not just the dramatic raids and battles, but the endless marching, the constant vigilance, the thousand small decisions that determine life and death.
