EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)
EXTERNAL removeItem(itemId, quantity)
EXTERNAL hasItem(itemId)
EXTERNAL addHeat(amount)
EXTERNAL changeStat(stat, delta)
EXTERNAL markChapterStarted(chapterId)
EXTERNAL discoverHex(q, r)

== start
{showImage("artwork/march.jpg")}

The English fleet crashes against the Norman coast. Salt spray and the shouts of men fill the air as your longboat grinds onto the shingle beach. You leap into the knee-deep water, your boots sinking into the pebbles, and wade ashore with the first wave of men-at-arms.

{markChapterStarted("chevauchee")}
{advanceTime(30)}

Sir Robert de Beaumont, your commander, stands tall on the beach amid the chaos of disembarkation. His gleaming armor and crimson surcoat mark him as a noble-born, though the weariness in his eyes speaks of countless campaigns.

"Men!" he calls, his voice cutting through the din. "We stand on French soil once more! King Edward has sent us to remind these French nobles why they should fear the English bow!"

The men cheer, raising their weapons and shields.

{addHeat(5)}

* "What are our orders, Sir Robert?"
  He turns to you, noting the determined look in your eyes. "Eager, are we? Good. We're here to burn, pillage, and show these French cowards what English steel can do. But we'll do it properly."

  {advanceTime(10)}

  "First, we assemble the companies. Then we march inland. The French won't expect us so deep in their territory this early in the season."
  -> assembly

* "How many men do we have?"
  Sir Robert gestures to the continuing stream of boats landing on the beach. "Five hundred good men, mostly archers and men-at-arms. Enough to strike fear into any village we encounter, but not enough to take a fortified town."

  {advanceTime(10)}

  "We'll move fast, strike hard, and disappear before they can muster a proper response. That's the chevauchée way."
  -> assembly

* "What's the target?"
  "Targets?" Sir Robert laughs, a harsh sound. "Everything! Farms, villages, mills, churches - if it burns and belongs to the French, it's fair game. We'll bleed this land dry."

  {addHeat(3)}
  {advanceTime(10)}

  "But first, let's get organized. The French patrols will be looking for us soon enough."
  -> assembly

== assembly
Within the hour, all five hundred men are ashore and formed up on the beach. The longboats are pulled back into the surf, ready to make a quick escape if needed. You stand with the other men-at-arms, watching as Sir Robert addresses the assembled force.

{advanceTime(60)}

"Brothers!" he shouts, his voice carrying over the waves. "We are the King's vengeance! We are the fire that will cleanse this land! For England!"

"For England!" the men roar back.

{addHeat(2)}

* "I'm ready to march, Sir Robert."
  He nods approvingly. "Good spirit. You'll be in the vanguard with me. I need men I can trust at the front."

  {changeStat("stress", -1)}
  {advanceTime(5)}

  "Stay close and follow my lead. This isn't just about plunder - it's about sending a message."
  -> march_orders

* "What about supplies?"
  "Good question," Sir Robert says, pointing to the organized supply wagons being unloaded from the last boats. "We have enough food for two weeks, if we're careful. Water will be the challenge - we'll need to find streams or wells."

  {getSupplies()}
  {advanceTime(5)}

  "Ration your water carefully. We can't afford to be slowed down by thirst."
  -> march_orders

* "When do we start the raiding?"
  Sir Robert's eyes gleam with anticipation. "Soon enough. First we move inland, away from the coast where the French expect us. We'll find a soft target - an isolated village or wealthy farm."

  {addHeat(2)}
  {advanceTime(5)}

  "Patience, man. The best plunder comes to those who wait for the right moment."
  -> march_orders

== march_orders
The sun climbs higher as the army forms into marching columns. Sir Robert gathers his officers around a makeshift table spread with a rough map of the region.

{advanceTime(30)}

"We'll march east along this valley," he explains, tracing a line with his dagger. "There are several villages that way, and the land is rich. The French won't expect us to move this far inland so quickly."

{discoverHex(2, 1)}
{addHeat(1)}

* "I'll scout ahead, Sir Robert."
  "Brave, but foolish alone. Take two archers with you. I want eyes on that village at the bend in the river - the one marked 'Saint-Martin.'"

  {changeStat("stress", 1)}
  {advanceTime(15)}

  "Report back in two hours. If you see French patrols, avoid them. We need the element of surprise."
  -> scout_mission

* "What's our marching order?"
  "Archers and light infantry in front, followed by the supply wagons, then heavy cavalry and us men-at-arms bringing up the rear," Sir Robert explains. "Standard chevauchée formation - ready to fight or flee at a moment's notice."

  {advanceTime(10)}

  "You'll ride with me and the other knights. Keep your eyes peeled for any sign of trouble."
  -> column_formation

* "How far to the first target?"
  "If we maintain a good pace, we should reach the first village by nightfall," Sir Robert says, studying the map. "Saint-Martin-de-Bois - a wealthy farming community according to our intelligence."

  {addHeat(1)}
  {advanceTime(10)}

  "We'll camp outside the village and strike at dawn. They'll never know what hit them."
  -> first_target

== scout_mission
You and two archers slip away from the main column, moving quietly through the rolling Norman countryside. The land is beautiful - green hills, small forests, and neat fields divided by stone walls. It's hard to remember you're here to destroy it.

{advanceTime(90)}

{discoverHex(3, 2)}
{discoverHex(4, 2)}

After an hour of careful movement, you crest a hill and see it below - Saint-Martin-de-Bois. A small village clustered around a stone church, with neat houses and well-tended fields. Smoke rises from chimneys, and you can see villagers going about their daily work, completely unaware of the approaching English army.

{addHeat(3)}

* "Let's get closer for a better look."
  The archers nod, and you descend the hill carefully, using the cover of a small woodlot. From the edge of the trees, you can see the village clearly - perhaps thirty houses, a mill by the stream, and what looks like a manor house on the hill.

  {advanceTime(30)}

  No sign of soldiers or fortifications. This village is completely undefended.
  -> village_details

* "I've seen enough. Let's report back."
  The archers agree, and you make your way back to the main column. The village looks rich and completely unprepared for what's coming.

  {changeStat("stress", 2)}
  {advanceTime(60)}

  Sir Robert will be pleased with this intelligence.
  -> report_back

* "Should we warn them?"
  The archers look at you strangely. "Warn them? We're here to raid, not make friends," one says. "This is war, man. They're French, we're English. That's all that matters."

  {changeStat("stress", -2)}
  {advanceTime(15)}

  Still, you can't shake the feeling that what you're doing is wrong.
  -> moral_conflict

== column_formation
You fall in with Sir Robert and the other knights as the army begins its march inland. The column stretches for nearly a mile, a serpent of steel and determination winding through the Norman countryside.

{advanceTime(120)}

{discoverHex(2, 2)}
{discoverHex(3, 2)}

The local peasants flee at your approach, abandoning their fields and running for the safety of the woods or nearby villages. Smart of them - you've seen what happens to those who resist.

{addHeat(2)}

* "Should we take any prisoners?"
  Sir Robert shakes his head. "Too much trouble. We're moving fast and light. Unless they're nobles who can be ransomed, kill anyone who resists and drive off the rest."

  {changeStat("stress", 1)}
  {advanceTime(10)}

  "Remember, terror is as valuable as plunder. If word spreads of our ruthlessness, the next village will surrender without a fight."
  -> ruthless_efficiency

* "What about the church?"
  "Churches are off-limits unless they're storing wealth or harboring soldiers," Sir Robert says firmly. "We're here to raid the French, not anger God. Besides, burning churches just makes the French fight harder."

  {advanceTime(10)}

  "But don't hesitate to take any silver or valuables you find there. God won't miss them."
  -> church_policy

* "How do we know which villages are wealthy?"
  "Look for stone houses, tile roofs, and large fields," Sir Robert explains. "Poor villages have wooden huts and thatched roofs. Wealth means better plunder."

  {addHeat(1)}
  {advanceTime(10)}

  "Also watch for mills, vineyards, and manor houses. Those are always worth the effort."
  -> wealth_indicators

== first_target
As dusk approaches, the army arrives in the hills overlooking Saint-Martin-de-Bois. The village looks peaceful in the evening light, completely unaware of the fate about to befall it.

{advanceTime(60)}

{discoverHex(4, 3)}

Sir Robert gathers his commanders. "We strike at dawn. I want the archers to surround the village and cut off any escape. The men-at-arms will go in first, secure the manor house and church. Then we'll gather the villagers and begin the systematic looting."

{addHeat(5)}

* "I want to lead the assault on the manor."
  Sir Robert claps you on the shoulder. "Good! That's where the real wealth will be. Take ten men and secure it before the villagers can organize any resistance."

  {changeStat("stress", 2)}
  {advanceTime(15)}

  "But be careful - wealthy men often have guards, even in remote villages."
  -> manor_assault

* "What if they surrender peacefully?"
  "Then we take what we want and leave the village intact," Sir Robert says. "A peaceful surrender means less risk for us and still achieves our objectives. But don't count on it - the French are proud."

  {advanceTime(10)}

  "Still, if they offer no resistance, spare the church and don't harm the women and children unnecessarily."
  -> peaceful_option

* "How much plunder are we expecting?"
  "A village this size should yield at least a hundred pounds in silver and goods," Sir Robert estimates. "Plus whatever we can carry - food, wine, tools, anything of value."

  {addHeat(1)}
  {advanceTime(10)}

  "Each man should get a good share. But remember - the King gets his tenth first."
  -> plunder_expectations

== DONE
{addHeat(10)}
{advanceTime(480)}

The first day of the chevauchée is complete. You've successfully landed in Normandy, assembled your forces, and identified your first target. Tomorrow, the real work begins.

The village of Saint-Martin-de-Bois sleeps peacefully below, completely unaware that by this time tomorrow, it will be burning and its wealth will be heading back to England.

{changeStat("stress", 3)}

This is the chevauchée - war not for glory or honor, but for profit and terror. And you are right in the middle of it.
