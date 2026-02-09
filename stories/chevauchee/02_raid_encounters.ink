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
EXTERNAL triggerSkirmish(skirmishType)

== start
=== raid_village_1
{showImage("artwork/signup.jpg")}

The village of Saint-Martin-de-Bois lies sleeping in the pre-dawn darkness. Sir Robert gathers the raiders for final instructions.

{advanceTime(30)}

"Archers will surround the village and cut off escape routes. Men-at-arms will secure the church and manor first - that's where the wealth will be. Then we'll gather the villagers and begin systematic looting."

{addHeat(5)}

* "I'll lead the assault on the manor."
  Sir Robert nods. "Good. Take ten men. The lord might have guards, but they'll be surprised. Secure the family and any valuables."

  {changeStat("stress", 2)}
  {advanceTime(15)}
  -> manor_assault

* "What if they resist?"
  "Then we make an example of them," Sir Robert says coldly. "But try to take the village intact. Burning it too early reduces the plunder."

  {advanceTime(10)}
  -> village_raid

* "I'll help round up the villagers."
  "Good thinking. Keep them together in the square. Don't let them scatter - that just makes the looting harder."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> villager_roundup

== manor_assault
You and your men creep through the sleeping village toward the manor house on the hill. The building is larger than you expected - two stories of stone, with a small wall around it.

{advanceTime(20)}

The heavy oak door is locked, but that's what axes are for. Three blows and it splinters open.

{addHeat(3)}

* "Search the ground floor first!"
  Your men spread out, kicking in doors and overturning furniture. Silver plates, expensive cloth, bags of coins - the lord was wealthy.

  {advanceTime(30)}
  -> ground_floor_loot

* "Upstairs! The family will be there!"
  You lead the charge up the stone stairs. The master bedroom is at the end of the hall - a heavy door, slightly ajar.

  {changeStat("stress", 2)}
  {advanceTime(15)}
  -> upstairs_confrontation

* "Secure the perimeter first!"
  "Smart," you tell your men. "Two of you guard the door, the rest with me. We don't want any surprises."

  {advanceTime(10)}
  -> perimeter_secure

== ground_floor_loot
The ground floor yields impressive results. The lord's study contains a strongbox - your axe makes short work of it. Fifty pounds in silver, plus documents and a fine sword.

{advanceTime(25)}

{addHeat(2)}

The kitchen has stores of fine wine, salt, and spices - rare luxuries in these times. Your men are already loading them into sacks.

* "This is incredible! The lord was rich!"
  "Norman lords always are," one of your men says. "They tax their peasants mercilessly."

  {advanceTime(10)}
  -> continue_search

* "We should check upstairs too."
  "Definitely," you agree. "The family's personal jewelry will be up there. And the lady's chambers."

  {changeStat("stress", 1)}
  {advanceTime(15)}
  -> upstairs_search

* "Let's take what we have and go."
  "Not yet," you decide. "There's more wealth here. We're not leaving until we've stripped this place clean."

  {addHeat(1)}
  {advanceTime(10)}
  -> thorough_search

== upstairs_confrontation
You burst into the master bedroom to find the lord and his wife cowering in the corner. The lord reaches for a sword by the bed, but you're faster.

{advanceTime(10)}

"Please," the lady begs, "take whatever you want, but spare us!"

{addHeat(3)}

* "Tell me where you keep your valuables!"
  The lord points to a chest in the corner. "There! Take it all! Just don't harm my family!"

  {advanceTime(15)}
  -> chest_loot

* "Tie them up and search the room."
  Your men quickly bind the couple. The room contains jewelry boxes, silver brushes, fine clothing - all worth good money.

  {changeStat("stress", 2)}
  {advanceTime(20)}
  -> room_loot

* "Kill them and take everything."
  "No!" one of your men protests. "They're nobles - they could be ransomed!"

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> ransom_decision

== village_raid
The village erupts in chaos as your raiders swarm through the streets. Cries of alarm mingle with the sounds of breaking doors and screaming villagers.

{advanceTime(30)}

{addHeat(4)}

You move from house to house, your men systematically looting each one. Most villagers flee or surrender immediately, but a few try to resist.

* "Burn the houses that resist!"
  "Sir Robert's orders," you remind your men. "Take what you can, then burn the rest. We need to move quickly."

  {advanceTime(20)}
  -> systematic_burning

* "Gather all the villagers in the square!"
  "Good idea," you agree. "Keep them together. It's easier to control them and prevent organized resistance."

  {advanceTime(15)}
  -> villager_control

* "Focus on the wealthy houses only!"
  "Smart," you tell your men. "Skip the peasants' huts - they have nothing worth taking. Hit the merchants and artisans."

  {advanceTime(25)}
  -> targeted_looting

=== raid_village_2
{showImage("artwork/seige.jpg")}

The village of Le Petit-Val is different - it's organized and ready. As you approach, a horn sounds and villagers emerge with makeshift weapons - pitchforks, axes, hunting bows.

{advanceTime(15)}

{addHeat(3)}

"Form up!" Sir Robert commands. "They want to fight? We'll give them a fight!"

* "Archers! Loose arrows at their leaders!"
  The English archers respond instantly, their arrows cutting down the villagers at the front. The rest hesitate.

  {advanceTime(10)}
  -> arrow_barrage

* "Charge! Break their line!"
  You lead the men-at-arms forward. The villagers break and run almost immediately.

  {changeStat("stress", 2)}
  {advanceTime(15)}
  -> village_charge

* "Surround them! Don't let anyone escape!"
  "Good thinking," Sir Robert agrees. "Cut off their retreat. They chose to fight - now they pay the price."

  {advanceTime(20)}
  -> surround_village

== arrow_barrage
The English arrows devastate the village militia. The untrained peasants fall by the dozen, their courage breaking under the professional assault.

{advanceTime(10)}

{addHeat(2}

The remaining villagers throw down their weapons and surrender.

* "Accept their surrender!"
  Sir Robert nods. "Good. Kill the leaders, spare the rest. We need labor to help us loot."

  {advanceTime(15)}
  -> selective_execution

* "Kill them all! They resisted!"
  "No," Sir Robert decides. "Dead peasants can't help us carry loot. Take the able-bodied as prisoners."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> prisoner_taking

* "Burn the village anyway!"
  "Definitely," Sir Robert agrees. "They resisted - they need to be made an example of."

  {addHeat(3)}
  {advanceTime(20)}
  -> example_burning

=== raid_monastery_1
{showImage("artwork/march.jpg")}

The Abbey of Saint-Jude appears ahead - a wealthy religious house with extensive lands. The monks are working in the fields when your raiders appear.

{advanceTime(20)}

{addHeat(2)}

The abbot approaches, his hands raised in peace. "In the name of God, spare us! We are men of peace!"

* "God won't save you from English steel!"
  "Wait," Sir Robert holds up a hand. "Monasteries often have good silver. But they're also off-limits unless they resist."

  {advanceTime(10)}
  -> monastery_negotiation

* "Take everything! God helps those who help themselves!"
  The monks pale at your words. Some fall to their knees, praying aloud.

  {changeStat("stress", 2)}
  {advanceTime(15)}
  -> monastery_raid

* "How much can you pay for your lives?"
  The abbot considers this. "We have some silver, but not much. The harvest was poor this year."

  {advanceTime(10)}
  -> monastery_tribute

== monastery_negotiation
Sir Robert dismounts and approaches the abbot. "We're not here to harm men of God, provided you cooperate."

{advanceTime(15)}

The abbot nods eagerly. "Anything! What do you want?"

* "Your silver and food stores."
  "Of course," the abbot agrees. "Take what you need, but spare the church and our brothers."

  {advanceTime(20)}
  -> peaceful_monastery

* "Information about French patrols."
  "I... I don't know much," the abbot stammers. "But there was a patrol yesterday, heading east toward the main road."

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> monastery_intel

* "Horses and guides."
  "We have a few good horses," the abbot offers. "And Brother Michel knows these lands well."

  {advanceTime(15)}
  -> monastery_resources

=== raid_farm_1
The farm complex is large and prosperous - multiple barns, a fine manor house, extensive fields. The farmer and his family watch your approach with terror.

{advanceTime(10)}

{addHeat(1)}

"Please," the farmer begs, "take what you want, but spare our home!"

* "Where's your wealth hidden?"
  "In the root cellar," the farmer admits reluctantly. "But it's not much - just our life savings."

  {advanceTime(15)}
  -> cellar_loot

* "We need your horses and wagon."
  "Take them," the farmer says quickly. "Just leave us enough to survive the winter."

  {changeStat("stress", 1)}
  {advanceTime(10)}
  -> livestock_seizure

* "Your fields look good. We'll take the harvest."
  The farmer pales. "That's our entire year's income! Without it, we'll starve!"

  {addHeat(2)}
  {advanceTime(10)}
  -> harvest_theft

=== raid_mill_1
The mill is a valuable target - it serves several villages and generates steady income. The miller stands ready to defend it with a heavy hammer.

{advanceTime(15)}

{addHeat(1)}

"This mill belongs to the Abbey of Saint-Jude!" he declares. "Attacking it means attacking God!"

* "God won't stop English steel!"
  The miller swallows hard but stands his ground. "I'll die before I let you destroy my livelihood!"

  {advanceTime(10)}
  -> miller_resistance

* "We don't want to destroy it - we want to use it!"
  The miller looks confused. "Use it? For what?"

  {changeStat("stress", -1)}
  {advanceTime(10)}
  -> mill_negotiation

* "How much flour can you produce for us?"
  "A lot," the miller admits. "If you spare the mill, I'll grind whatever grain you bring me."

  {advanceTime(15)}
  -> mill_cooperation

=== raid_merchant_caravan
A merchant caravan is camped by the road - three wagons, heavily laden, with a dozen guards. They spotted you too late to escape.

{advanceTime(20)}

{addHeat(3)}

The merchant leader holds up his hands. "We're peaceful traders! We pay tribute! Don't harm us!"

* "Unload the wagons - now!"
  The guards look nervous but don't resist. Ten men against five hundred is not a fight they can win.

  {advanceTime(25)}
  -> caravan_loot

* "We'll take your best horses and half your goods."
  "Generous," the merchant says with relief. "Thank you for your mercy."

  {changeStat("stress", -1)}
  {advanceTime(15)}
  -> caravan_tribute

* "Kill the guards and take everything!"
  "No," Sir Robert decides. "The merchant might be useful later. Live merchants can bring more wealth."

  {advanceTime(10)}
  -> caravan_mercy

=== raid_castle_outskirts
The castle is too strong to attack, but its outskirts are vulnerable - farms, workshops, and houses that support the fortress.

{advanceTime(30}

{addHeat(2}

The castle watch has spotted you, but they're not sending out troops - smart of them. You have free rein over the surrounding area.

* "Burn everything! Starve them out!"
  Your men move systematically through the farms, torching buildings and destroying crops. Smoke rises to signal the castle's doom.

  {advanceTime(45}
  -> castle_starvation

* "Focus on the workshops and stores!"
  "Good thinking," Sir Robert agrees. "The castle depends on these for supplies. Destroy them and the fortress becomes vulnerable."

  {advanceTime(30}
  -> workshop_destruction

* "Take prisoners for interrogation!"
  "Excellent idea," Sir Robert nods. "These people will know the castle's weaknesses, patrol schedules, supply levels."

  {changeStat("stress", 1)}
  {advanceTime(20}
  -> prisoner_intel

=== raid_vineyard_1
The vineyard is extensive - rows of grapevines stretching across the hills, with a fine manor house and wine cellars.

{advanceTime(25}

{addHeat(1}

The vintner approaches cautiously. "The wine is not yet ready for harvest, but the cellars are well-stocked with previous vintages."

* "Show us the cellars!"
  The vintner leads you underground. The cellars are impressive - hundreds of barrels of fine wine.

  {advanceTime(20}
  -> wine_cellar

* "We'll take what we can carry and burn the rest!"
  "No!" the vintner protests. "That wine represents years of work! Generations!"

  {changeStat("stress", 2}
  {advanceTime(15}
  -> wine_destruction

* "How much can you pay to spare the vineyard?"
  The vintner considers this. "I have some silver, and the wine is valuable. Name your price."

  {advanceTime(10}
  -> vineyard_tribute

=== raid_salt_mine
The salt mine is a strategic target - salt is valuable for preserving food and essential for armies. The miners are rough men, but not fighters.

{advanceTime(15}

{addHeat(2}

The mine foreman approaches. "The mine belongs to the Count of Flanders! Attacking it means his wrath!"

* "The Count can't protect you from us!"
  The miners exchange nervous looks. They're caught between their lord and your swords.

  {advanceTime(10}
  -> miner_intimidation

* "We'll take the salt and spare your lives!"
  "Reasonable," the foreman agrees. "The salt is yours. Just leave us enough to live."

  {changeStat("stress", -1}
  {advanceTime(15}
  -> salt_negotiation

* "How much salt do you have stored?"
  "Enough to supply an army," the foreman boasts. "The Count's stores are extensive."

  {advanceTime(10}
  -> salt_inventory

=== raid_fishing_village
The fishing village sits on the coast - small but prosperous, with warehouses full of salted fish and several good boats.

{advanceTime(20}

{addHeat(1}

The fishermen watch your approach from their boats, already preparing to flee to sea.

* "Block the harbor! Don't let them escape!"
  Your men rush to secure the boats. The fishermen are trapped.

  {advanceTime(15}
  -> harbor_blockade

* "Focus on the warehouses!"
  "Smart," Sir Robert agrees. "The boats are useless without the fish. The warehouses are the real prize."

  {advanceTime(25}
  -> warehouse_loot

* "Take their boats - we can use them!"
  "Good thinking," Sir Robert nods. "Having boats gives us more options for escape or coastal raids."

  {changeStat("stress", 1}
  {advanceTime(20}
  -> boat_seizure

=== raid_blacksmith
The blacksmith's forge is a valuable target - weapons, tools, and armor are always needed. The smith is a big man, hammer in hand, ready to defend his livelihood.

{advanceTime(15}

{addHeat(1}

"This forge serves the local lord!" he declares. "Attacking it means attacking the nobility!"

* "Your forge serves us now!"
  The blacksmith looks at your five hundred men and slowly lowers his hammer. "What do you want?"

  {advanceTime(10}
  -> forge_surrender

* "We need weapons and armor repaired!"
  "I can do that," the blacksmith agrees. "My skills are yours, for a price."

  {changeStat("stress", -1}
  {advanceTime(15}
  -> forge_services

* "Show us your inventory!"
  The blacksmith leads you to his storeroom. Swords, axes, armor pieces, tools - a wealth of metalwork.

  {advanceTime(20}
  -> forge_loot

=== raid_tavern
The tavern is the social center of the region - a place where travelers gather, information flows, and wealth accumulates.

{advanceTime(10}

{addHeat(1}

The tavern keeper is a pragmatic woman. "I have wine, food, and some coin. Take what you want, but spare my establishment."

* "We need information about the area!"
  "I'll tell you everything I know," she offers quickly. "Patrol schedules, wealthy targets, safe routes."

  {advanceTime(15}
  -> tavern_intel

* "Your best wine and all your coin!"
  "Of course," she agrees, moving to the cash box. "The wine is excellent - imported from Gascony."

  {advanceTime(20}
  -> tavern_loot

* "We're taking over this tavern as a base!"
  "As you wish," the tavern keeper says smoothly. "I'll serve your men. It's better than the alternative."

  {changeStat("stress", 1}
  {advanceTime(10}
  -> tavern_base

=== raid_church_1
The village church is old and wealthy - stone construction, silver altar pieces, donations from generations of the faithful.

{advanceTime(15}

{addHeat(2}

The priest stands before the altar. "This is God's house! Desecrating it brings eternal damnation!"

* "God helps those who help themselves!"
  The priest crosses himself. "Take the silver, but spare the sacred relics. They belong to God, not to men."

  {advanceTime(10}
  -> church_negotiation

* "Everything in this church is ours now!"
  The priest pales but stands his ground. "I will die before I let you desecrate this sacred place!"

  {changeStat("stress", 2}
  {advanceTime(15}
  -> church_resistance

* "How much can the church pay for its protection?"
  The priest considers this. "We have some silver, but not much. The villagers are poor."

  {advanceTime(10}
  -> church_tribute

=== raid_market_town
The market town is larger than most targets - a center of regional trade with permanent shops, warehouses, and a small garrison.

{advanceTime(30}

{addHeat(3}

The garrison commander sends a messenger. "The town will pay tribute if you spare it. Name your price."

* "We want half of all goods in the warehouses!"
  "Agreed," the messenger returns quickly. "The warehouses are yours. Just leave the town intact."

  {advanceTime(45}
  -> market_tribute

* "Surrender or we burn everything!"
  The town bells ring - the signal to surrender. The gates open and the townspeople emerge.

  {advanceTime(20}
  -> market_surrender

* "We'll take what we want and burn the rest!"
  The messenger pales. "Mercy! We'll pay double the normal tribute!"

  {addHeat(2}
  {advanceTime(15}
  -> market_negotiation

== DONE
{addHeat(5)}
{advanceTime(120)}

The raiding continues, each target yielding different challenges and rewards. Some surrender peacefully, others resist futilely. Wealth accumulates, but so does the heat - the French are surely organizing their response.

{changeStat("stress", 3)}

This is the heart of the chevauchée - systematic destruction and looting, breaking the French will to fight by destroying their economic base. Every village burned, every farm looted, every church plundered serves the greater strategy.

But with each raid, the risk increases. The French won't let this continue unanswered.
