// Test Ink Scene - Simple Combat Encounter
// This demonstrates a working Ink scene with proper variable declarations

VAR combatSkill = 0
VAR enemyHealth = 10
VAR playerHealth = 10
VAR combatResult = ""

// External functions for game integration
EXTERNAL doCheck(stat, difficulty)
EXTERNAL applyStatChange(stat, amount)
EXTERNAL addCondition(name, type, duration)

=== test_combat_encounter ===
# artwork: battlefield.jpg
# caption: The clash of steel echoes across the field

The enemy warrior charges at you, sword raised high. Combat begins!

Your current strength: {gameState.stats.strength}
Your current agility: {gameState.stats.agility}

* [Attack with sword] -> sword_attack
* [Try to dodge and counter] -> dodge_counter
* [Use your shield defensively] -> shield_defense

=== sword_attack ===
You swing your sword with determination.

{ EXTERNAL doCheck("strength", 6) :
  ~ applyStatChange("strength", 1)
  ~ enemyHealth -= 3
  Your powerful strike lands true, wounding the enemy!
  - else -
  ~ applyStatChange("stress", 1)
  Your swing misses, leaving you vulnerable.
}

Enemy health remaining: {enemyHealth}

{enemyHealth > 0:
  * [Press the attack] -> sword_attack
  * [Fall back and regroup] -> regroup
  - else -
  * [Finish the enemy] -> victory
}

=== dodge_counter ===
{ EXTERNAL doCheck("agility", 7) :
  ~ applyStatChange("agility", 1)
  ~ enemyHealth -= 2
  You dodge nimbly and counter with a precise strike!
  - else -
  ~ applyStatChange("stress", 1)
  ~ playerHealth -= 1
  Your dodge fails and you take a hit!
}

Your health: {playerHealth}
Enemy health: {enemyHealth}

{playerHealth > 0 and enemyHealth > 0:
  * [Continue dodging] -> dodge_counter
  * [Switch to offense] -> sword_attack
  - else if playerHealth <= 0 -
  * [Retreat from combat] -> defeat
  - else -
  * [Finish the fight] -> victory
}

=== shield_defense ===
You raise your shield, bracing for impact.

{ EXTERNAL doCheck("endurance", 5) :
  ~ applyStatChange("endurance", 1)
  You successfully block the attack and push back!
  - else -
  ~ applyStatChange("stress", 1)
  ~ playerHealth -= 2
  The force of the blow rattles you!
}

Your health: {playerHealth}

{playerHealth > 0:
  * [Counter with sword] -> sword_attack
  * [Try another defense] -> shield_defense
  - else -
  * [Retreat while you can] -> defeat
}

=== regroup ===
You step back to catch your breath and reassess.

{ EXTERNAL doCheck("wits", 6) :
  ~ applyStatChange("wits", 1)
  You spot an opening in the enemy's guard.
  - else -
  The enemy presses the advantage.
}

* [Renew the attack] -> sword_attack
* [Try a different tactic] -> dodge_counter

=== victory ===
~ combatResult = "victory"
~ applyStatChange("experience", 2)
~ applyStatChange("morale", 1)

You stand victorious over your fallen foe. The battle is won!

{strength >= 8:
  Your strength was key to this victory.
  - else if agility >= 8 -
  Your speed and reflexes carried the day.
  - else -
  Through determination and skill, you prevailed.
}

* [Continue your journey] -> END

=== defeat ===
~ combatResult = "defeat"
~ applyStatChange("stress", 2)
~ applyStatChange("morale", -1)
~ addCondition("wounded", "negative", 2)

You fall back, wounded and defeated. The enemy warrior spares your life, but you've been humbled.

{strength <= 4:
  Your lack of strength cost you dearly.
  - else if agility <= 4 -
  Your sluggish movements left you exposed.
  - else -
  Sometimes even the best warriors face defeat.
}

* [Retreat and recover] -> END
