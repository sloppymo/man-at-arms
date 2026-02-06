// Training scenarios for A Man-At-Arms' Life
// Additional training content beyond basic training

=== training_advanced ===
# artwork: advanced-training.jpg
# caption: Advanced training drills

Your basic training is complete, but real combat requires more.

{gameState.stats.strength >= 7 :
  Your strength makes you a natural for heavy weapons.
  - else if gameState.stats.agility >= 7 -
  Your agility suggests you'd excel with light weapons.
  - else -
  You'll need to find your fighting style through experience.
}

* [Practice with longsword] -> longsword_training
* [Learn polearm techniques] -> polearm_training
* [Study shield tactics] -> shield_training

=== longsword_training ===
# artwork: longsword-training.jpg
# caption: The longsword feels heavy but balanced

The longsword requires both strength and technique.

{EXTERNAL hasShieldEquipped() :
  You practice one-handed techniques with your shield.
  - else -
  You focus on two-handed grips for maximum power.
}

{gameState.stats.strength >= 6 :
  The weapon feels natural in your hands.
  - else -
  The weight challenges you, but you're learning.
}

* [Continue practicing] ~ strength += 1 -> training_complete

=== polearm_training ===
# artwork: polearm-training.jpg
# caption: The polearm gives you reach advantage

Polearms require different tactics - reach over brute force.

{gameState.stats.agility >= 6 :
  You move well with the long weapon.
  - else -
  The length takes getting used to.
}

* [Continue practicing] ~ agility += 1 -> training_complete

=== shield_training ===
# artwork: shield-training.jpg
# caption: Your shield becomes an extension of your body

Shield work is as much about positioning as blocking.

{EXTERNAL hasShieldEquipped() :
  Your shield work improves with practice.
  - else -
  You practice with borrowed shields.
}

{gameState.stats.endurance >= 6 :
  You can maintain your guard for long periods.
  - else -
  Your arms tire quickly, but you're building endurance.
}

* [Continue practicing] ~ endurance += 1 -> training_complete

=== training_complete ===
# artwork: training-graduation.jpg
# caption: Your training is complete

Your advanced training is complete. You're ready for real combat.

{gameState.stats.strength >= 7 :
  Your strength will serve you well on the battlefield.
  - else if gameState.stats.agility >= 7 -
  Your agility will help you avoid danger.
  - else -
  You've learned to rely on your wits and endurance.
}

* [Ready for battle] -> END
