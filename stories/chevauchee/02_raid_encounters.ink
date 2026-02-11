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
EXTERNAL addSupply(type, amount)

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
~ addHeat(5)
~ advanceTime(120)

The raiding continues. Villages burn. Supplies accumulate. The French respond.

~ changeStat("stress", 3)

=== raid_cottage
{showImage("artwork/burn_line.jpg")}

You find a small cottage on the outskirts of a burned village. The thatch roof smolders but has not yet caught fully. Smoke curls lazily into the morning sky.

{advanceTime(10)}

{addHeat(1)}

Pushing open the door, you enter. The air smells of milk and damp wool. A woman kneels by the hearth, her face turned to the floor and her eyes shut in silent prayer. A man lies against the far wall, struggling to breathe through labored gasps - perhaps injured in the earlier chaos. A child watches from behind the door, silent and wide-eyed, not crying.

You overturn the grain bin and find it lined with coins sewn into linen bags - their life savings. A cured ham hangs in the rafters, and a sack of beans lies beneath the bed.

* [Take everything.] -> cottage_take_all
* [Take the ham and half the coins.] -> cottage_take_essentials
* [Take only the ham.] -> cottage_show_mercy
* [Bind the man's wounds.] -> cottage_help_wounded

== cottage_take_all
You strip the cottage bare - the coins, ham, beans, even the wool blankets from the bed. The woman doesn't look up, but the child begins to whimper softly.

{addHeat(2)}
{changeStat("stress", 1)}
{changeStat("morale", -1)}
{consumeSupply("food", -3)}  // Gained supplies

The men load the goods onto the cart. That night, they eat well.

-> cottage_exit

== cottage_take_essentials
You take the ham and half the coins, leaving the beans and some coin for their survival. The woman raises her head slightly, hope flickering in her eyes.

{addHeat(1)}
{changeStat("morale", 1)}
{consumeSupply("food", -1)}

The men divide the ham among themselves. The child watches silently.

-> cottage_exit

== cottage_show_mercy
You take only the ham, leaving the coins and beans untouched. "Winter comes," you mutter, more to yourself than to them.

{changeStat("stress", -1)}
{changeStat("morale", 2)}
{changeStat("reputation", 1)}
{consumeSupply("food", -1)}

The woman does not look up. The man breathes shallowly against the wall.

-> cottage_exit

== cottage_help_wounded
You kneel by the man and examine his wounds - a deep gash from a falling beam. You bind it with strips from your own cloak and give him water from your flask.

{advanceTime(20)}
{changeStat("stress", -2)}
{changeStat("morale", 3)}
{changeStat("health", -1)}  // Using your supplies to help

The man opens his eyes and whispers thanks. He lives.

-> cottage_exit

== cottage_exit
{advanceTime(15)}

You leave the cottage, the smoldering roof finally catching fire behind you. The child watches from the door.

-> DONE

=== raid_roadside_family
{showImage("artwork/standoff.jpg")}

Along a narrow country road, you encounter a family fleeing the raids. They've loaded their lives into a two-wheeled cart: threadbare blankets, a wooden churn, a cage of scrawny hens. The ox pulling it is thin and blown from the pace, its ribs visible beneath matted hide.

{advanceTime(15)}

{addHeat(1)}

The father steps forward defiantly, a kitchen knife clutched in his trembling hand - a weapon that should never have been shown. The mother kneels in the dirt behind him, gathering butter that has spilled from the churn as if the scattered cream could still be saved.

* [Kill the father and take the cart.] -> roadside_take_cart_kill
* [Take the cart but spare the father.] -> roadside_take_cart_spare
* [Take the ox and hens.] -> roadside_take_livestock
* [Let them pass.] -> roadside_show_mercy

== roadside_take_cart_kill
You knock the father down with the flat of your sword, then run him through as he struggles in the dirt. The mother screams, the child wails. Your men seize the cart whole, the hens scattering in panic. One soldier cuts the ox loose and leads it away.

{addHeat(3)}
{changeStat("stress", 2)}
{changeStat("morale", -2)}
{consumeSupply("food", -2)}  // Cart contents

The cart holds blankets, churn, and a small hoard of flour. The screams echo in the morning air.

-> roadside_exit

== roadside_take_cart_spare
You disarm the father with a sharp blow, leaving him bruised but alive. "Go," you command. Your men take the cart, hens scattering wildly. The ox is cut loose and led away.

{addHeat(2)}
{changeStat("stress", 1)}
{consumeSupply("food", -2)}

The mother gathers what has spilled from the churn. The father watches you depart.

-> roadside_exit

== roadside_take_livestock
You take the ox and the cage of hens, leaving the cart and its pitiful contents. The family watches in stunned silence as you depart.

{addHeat(1)}
{changeStat("morale", 1)}
{consumeSupply("food", -1)}

The ox lows softly as it's led away. The cart sits abandoned on the road.

-> roadside_exit

== roadside_show_mercy
You lower your weapon. "Pass," you say simply. The father nods jerkily, the knife falling from his hand. They continue their desperate flight.

{changeStat("stress", -2)}
{changeStat("morale", 2)}
{changeStat("reputation", 1)}

The mother kneels in the road, gathering what has spilled from the churn.

-> roadside_exit

== roadside_exit
{advanceTime(10)}

The road stretches empty behind you. Another family displaced by the chevauchée's shadow.

-> DONE

=== raid_monastery_vignette
{showImage("artwork/Vigiles_du_roi_Charles_VII_32.jpg")}

The monastery gate is not built for war. It yields after the third blow from your men's axes. The brothers do not resist - they stand in the cloister yard with their hands folded into their sleeves, faces composed in resignation.

{advanceTime(20)}

{addHeat(2)}

You break the cellar doors to find wine in casks and salt beef in brine. In the sacristy, chalices gleam on the altar and a reliquary wrapped in cloth catches your eye.

The abbot approaches, his voice steady. "We are men of peace. Spare us!"

* [Take everything from the monastery.] -> monastery_take_burn
* [Take the wine and silver, spare the books.] -> monastery_take_spare
* [Take only what you need.] -> monastery_take_essentials
* [Spare the monastery entirely.] -> monastery_spare_all

== monastery_take_burn
Your men strip the silver from the chalices and reliquary. You stack the books in the yard and set them alight, the abbot watching with tears in his eyes as centuries of knowledge burn.

{addHeat(4)}
{changeStat("stress", 3)}
{changeStat("morale", -3)}
{consumeSupply("food", -5)}  // Wine and beef

The wine is excellent, the beef well-preserved. The ashes settle slowly.

-> monastery_exit

== monastery_take_spare
You take the wine, beef, and silver, but leave the books untouched. The abbot bows deeply. "You will be remembered."

{addHeat(2)}
{changeStat("stress", -1)}
{changeStat("morale", 1)}
{consumeSupply("food", -3)}

The brothers stand silent as you depart. The library remains.

-> monastery_exit

== monastery_take_essentials
You take the beef and some wine, leaving the silver chalices and reliquary. The abbot nods. "Practical mercy."

{addHeat(1)}
{changeStat("morale", 2)}
{consumeSupply("food", -2)}

The abbot watches you leave. The monastery stands diminished but intact.

-> monastery_exit

== monastery_spare_all
You sheath your sword. "This place will not be harmed," you declare. Your men grumble but obey. The abbot offers you bread and wine as guests.

{changeStat("stress", -3)}
{changeStat("morale", 4)}
{changeStat("reputation", 2)}
{changeStat("health", 1)}  // Rest and food

The brothers kneel in thanks. The monastery endures.

-> monastery_exit

== monastery_exit
{advanceTime(30)}

You leave the monastery behind, its bells tolling faintly in the distance. The chevauchée rolls on.

-> DONE

=== raid_smokehouse
~ showImage("artwork/burn_line.jpg")

The yard is empty but for a tethered goat and a line of shirts stiff with drying lye. The smokehouse door is barred. You pry it open and the smell of meat rolls out thick and sweet.

~ advanceTime(10)

~ addHeat(1)

Inside hang sides of pork and links of sausage dark with pepper. A man crawls from beneath the racks with a cleaver in his hand and blood already on his apron. He drops it when he sees how many of you there are.

You take the meat first. One of your men pockets the man's boots while he is made to kneel in the yard.

* [Kill the man and take everything.] -> smokehouse_kill_take_all
* [Take his boots and the goat.] -> smokehouse_spare_take_some
* [Take only the meat.] -> smokehouse_mercy
* [Recruit the man as a cook.] -> smokehouse_recruit

== smokehouse_kill_take_all
You run him through where he kneels. His blood mixes with the dirt. Your men strip the smokehouse bare - every link of sausage, every side of pork.

~ addHeat(3)
~ changeStat("stress", 2)
~ changeStat("morale", -1)
~ addSupply("food", 5)

That night the men eat well. No one speaks of the blood on the ground.

-> smokehouse_exit

== smokehouse_spare_take_some
You let him live but take his boots and untether the goat. "Walk home barefoot," you command. He nods, tears in his eyes.

~ addHeat(2)
~ changeStat("stress", 1)
~ changeStat("morale", 1)
~ addSupply("food", 2)

The man limps away barefoot. The goat follows obediently.

-> smokehouse_exit

== smokehouse_mercy
You leave him his boots and the goat. "The meat is ours, but you may keep your dignity." He whispers thanks as you depart.

~ changeStat("stress", -1)
~ changeStat("morale", 2)
~ changeStat("reputation", 1)
~ addSupply("food", 3)

The man does not look up as you leave. The meat is gone.

-> smokehouse_exit

== smokehouse_recruit
"You know meat," you say. "Come with us. Cook for our men." He hesitates, then nods. The army needs skilled hands.

~ changeStat("stress", -2)
~ changeStat("morale", 3)
~ gainSupply("food", 3)

He follows silently, cleaver still in hand.

-> smokehouse_exit

== smokehouse_exit
~ advanceTime(15)

The smokehouse stands empty, the scent of meat lingering in the air. Another piece of Normandy claimed by the chevauchée.

-> DONE

=== raid_manor_pantry
{showImage("artwork/signup.jpg")}

The manor hall stands intact, shutters closed, servants fled. Only the steward remains, keys at his belt and ink on his fingers. He speaks of accounts and obligations as though they will matter.

{advanceTime(15)}

{addHeat(2)}

You walk him to the pantry and have him open it himself. There are wheels of cheese, sacks of oats, jars of honey sealed in wax. In the strongroom, a small chest of rent silver waits for collection that will not come.

You leave the steward alive. He will be the one to explain what is gone.

* [Slit the steward's throat and take everything.] -> pantry_take_all_kill
* [Take the silver and supplies, leave the steward.] -> pantry_take_most_spare
* [Take only what you need for the march.] -> pantry_take_essentials
* [Take the silver, leave the rest.] -> pantry_leave_portion

== pantry_take_all_kill
You slit the steward's throat after he unlocks everything. His body slumps by the pantry door. Your men load all the cheese, oats, honey, and silver.

~ addHeat(4)
~ changeStat("stress", 3)
~ changeStat("morale", -2)
~ addSupply("food", 8)

The manor accounts will never balance. The ink stains the steward's fingers even in death.

-> pantry_exit

== pantry_take_most_spare
You take the silver chest and most of the supplies, leaving a wheel of cheese and some oats. The steward watches silently as you depart.

~ addHeat(2)
~ changeStat("stress", 1)
~ addSupply("food", 6)

The steward remains to explain the emptiness. His ink-stained fingers tremble.

-> pantry_exit

== pantry_take_essentials
You take half the silver and enough supplies for your immediate needs. "This will sustain your household," you tell the steward.

~ addHeat(1)
~ changeStat("morale", 1)
~ addSupply("food", 4)

The steward nods. The pantry stands half-empty.

-> pantry_exit

== pantry_leave_portion
You take the silver but leave most of the pantry intact. "War is necessity," you say. The steward nods gratefully.

~ changeStat("stress", -1)
~ changeStat("morale", 2)
~ changeStat("reputation", 1)
~ addSupply("food", 2)

The steward will explain the silver's absence. The accounts show restraint.

-> pantry_exit

== pantry_exit
~ advanceTime(20)

The manor doors close behind you. The steward's accounts will show a new kind of obligation.

-> raid_abbey_granary

=== raid_abbey_granary
~ showImage("artwork/Vigiles_du_roi_Charles_VII_32.jpg")

The abbey fields lie trampled but the granary walls are stone and thick. The brothers stand apart while you force the door. Dust rises in the dim light and settles on your mail.

~ advanceTime(20)

~ addHeat(2)

Barrels of wheat are stacked to the rafters. There are beeswax candles by the hundred and bolts of wool meant for market. In the infirmary, a thin monk clutches a locked coffer to his chest until one of your men takes it from him.

The abbot approaches, his voice steady. "Spare the library. The books are worth more than silver."

* [Take everything and burn the granary.] -> granary_take_burn
* [Take the supplies and coin, spare the building.] -> granary_take_spare
* [Take only the coin.] -> granary_coin_only
* [Spare the abbey entirely.] -> granary_spare_all

== granary_take_burn
You load the wheat, candles, wool, and coin. Then you torch the granary. The brothers watch in silence as their winter stores burn.

~ addHeat(4)
~ changeStat("stress", 3)
~ changeStat("morale", -3)
~ addSupply("food", 10)

The coin will buy arms. The ashes drift across the fields.

-> granary_exit

== granary_take_spare
You take the coin, wheat, candles, and wool, but leave the building standing. The abbot inclines his head. "You will be remembered."

~ addHeat(2)
~ changeStat("stress", -1)
~ changeStat("morale", 1)
~ addSupply("food", 8)

The brothers stand silent as you depart. The granary endures.

-> granary_exit

== granary_coin_only
You take only the coffer of coin, leaving the granary untouched. The monk who guarded it lowers his eyes.

~ addHeat(1)
~ changeStat("morale", 2)
~ changeStat("reputation", 1)
~ addSupply("food", 2)

The coin alone will sustain your campaign. The granary remains full.

-> granary_exit

== granary_spare_all
You close the coffer and return it to the monk. "This place will not be touched." The brothers kneel in silence.

~ changeStat("stress", -3)
~ changeStat("morale", 4)
~ changeStat("reputation", 2)

The abbey stands untouched. The chevauchée passes it by.

-> granary_exit

== granary_exit
~ advanceTime(25)

The abbey granary stands silent. The chevauchée's shadow passes, leaving different marks depending on your choices.

-> DONE
