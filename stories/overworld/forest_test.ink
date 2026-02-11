EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)
EXTERNAL changeStat(stat, delta)
EXTERNAL addCondition(name, type, duration)
EXTERNAL triggerCombat(enemyId)
EXTERNAL resolveAction(stat, difficulty, bonus)
EXTERNAL showNotification(title, message, type)
EXTERNAL addItem(itemId, quantity)
EXTERNAL addHeat(amount)

== start

{showImage("artwork/test.png")}

You enter the ancient forest of Normandy. Towering oaks and twisted beeches form a dense canopy overhead, filtering the sunlight into dappled shadows on the forest floor. The air is thick with the scent of damp earth and decaying leaves.

{advanceTime(30)}

Half an hour into your journey, you hear strange sounds echoing through the trees - twigs snapping, muffled voices, and the occasional whinny of a horse.

What do you do?

* [Investigate the sounds] -> investigate_sounds
* [Continue along the main path] -> continue_path
* [Try to circle around quietly] -> circle_around

== investigate_sounds

{advanceTime(15)}

You creep closer, your heart pounding. Through the underbrush, you spot three rough-looking men armed with swords and bows. They appear to be bandits, arguing over the division of some stolen goods. One of them notices movement and shouts an alarm!

"Intruder! Get 'em!"

* [Charge into combat!] -> bandit_combat
* [Try to talk them down] -> bandit_diplomacy
* [Run back the way you came] -> bandit_escape

== bandit_combat

{triggerCombat("bandits")}

-> END

== bandit_diplomacy

You raise your hands peacefully. "Hold! I mean no harm. I'm just a traveler passing through."

The bandits pause, weapons half-drawn. Their leader, a scarred man with a missing tooth, eyes you suspiciously.

{resolveAction("charisma", 12, 0)}

{
- success:
  "Alright, traveler. You seem honest enough. But this forest ain't safe. Pay us a toll - 2 food supplies - and we'll let you pass."

  * [Pay the toll] -> pay_toll
  * [Refuse and fight] -> bandit_combat

- failure:
  "Nice try, but we ain't fools. Get 'em boys!"

  -> bandit_combat
}

== pay_toll

{consumeSupply("food", 2)}

You hand over the supplies. The bandits step aside, grumbling but allowing you to pass.

{changeStat("reputation", -1)}

Your reputation among the locals suffers from this cowardice, but at least you're alive.

-> forest_exit

== bandit_escape

You turn and run as fast as your legs can carry you!

{resolveAction("agility", 10, 0)}

{
- success:
  You crash through the underbrush, the bandits' arrows whistling past you harmlessly. You lose your way briefly but eventually find the forest edge again.

  {advanceTime(30)}
  {addCondition("exhausted", "negative", 2)}

  -> forest_exit

- failure:
  An arrow catches your leg as you flee! You stumble and fall, the bandits closing in...

  {changeStat("health", -2)}
  {addCondition("wounded", "negative", 4)}
  {advanceTime(45)}

  -> bandit_combat
}

== continue_path

{advanceTime(45)}

You press on, ignoring the sounds. The path narrows and becomes more overgrown. Suddenly, you stumble into a hidden glade - a peaceful clearing with a small spring and soft grass.

This seems like a good place to rest, but you also notice some interesting tracks leading deeper into the forest.

* [Rest here for a while] -> rest_glade
* [Follow the tracks deeper] -> explore_deeper
* [Continue past the glade] -> forest_exit

== rest_glade

{advanceTime(60)}

You sit by the spring and rest. The peaceful sounds of nature soothe your weary soul.

{consumeSupply("food", 1)}
{changeStat("health", 1)}
{removeCondition("exhausted")}

Refreshed, you continue your journey.

-> forest_exit

== explore_deeper

{advanceTime(30)}

Following the tracks, you discover an ancient ruined chapel, its stone walls overgrown with ivy. The air feels sacred here.

* [Search for hidden treasure] -> search_treasure
* [Pray for a blessing] -> pray_blessing
* [Leave this place] -> forest_exit

== search_treasure

You carefully search the chapel ruins, moving aside fallen stones and peering into dark corners.

{resolveAction("perception", 13, 0)}

{
- success:
  You find a small chest hidden behind the altar! Inside are some coins and a silver amulet.

  {addItem("coins", 15)}
  {addItem("silver_amulet", 1)}
  {showNotification("Treasure Found!", "You discovered 15 coins and a silver amulet!", "success")}

  -> chapel_exit

- failure:
  As you search, you disturb a wasps' nest! The angry insects swarm you.

  {changeStat("health", -1)}
  {addCondition("stung", "negative", 2)}
  {advanceTime(15)}

  -> chapel_exit
}

== pray_blessing

You kneel before the ruined altar and pray for guidance and protection.

{advanceTime(20)}

A sense of peace washes over you. You feel blessed.

{changeStat("morale", 2)}
{addCondition("blessed", "positive", 6)}

-> chapel_exit

== chapel_exit

As you leave the chapel, you feel the forest's secrets have touched you in some way.

-> forest_exit

== circle_around

{advanceTime(20)}

You attempt to circle around the suspicious area quietly.

{resolveAction("stealth", 11, 0)}

{
- success:
  You slip past undetected and find yourself on the far side of the disturbance. Whatever was there is now behind you.

  {advanceTime(30)}

  -> forest_exit

- failure:
  Your foot catches on a root and you stumble with a loud crash! The sounds ahead go quiet for a moment, then you hear approaching footsteps...

  -> investigate_sounds
}

== forest_exit

{advanceTime(30)}

You emerge from the forest onto familiar ground. The encounter has changed you somehow - for better or worse.

-> END
