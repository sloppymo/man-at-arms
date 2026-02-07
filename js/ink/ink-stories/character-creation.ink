// Character creation story for A Man-At-Arms' Life
// This handles the step-by-step character creation process

VAR characterName = ""
VAR ageRange = ""
VAR age = 27
VAR background = ""
VAR priorities = []
VAR patronId = ""

VAR strength = 5
VAR agility = 5
VAR endurance = 5
VAR charisma = 5
VAR luck = 5
VAR wits = 5
VAR wealth = 120
VAR reputation = 0
VAR morale = 5
VAR stress = 0

=== character_creation ===
# artwork: opening-tapestry.jpg
# caption: Here the soldiers lay waste to the land

The year is {gameState.year}. You are a man-at-arms in service to the {gameState.faction} crown.

The call to arms has reached you, and you've decided to join a lord's retinue.

First, what is your name?

* [Enter your name]
  -> name_selection

=== name_selection ===
# artwork: character-portrait.jpg
# caption: A fresh face ready for war

What shall you be known as?
~ characterName = "William Thatcher"

Your name is now {characterName}.

* [Continue to age selection]
  -> age_selection

=== age_selection ===
# artwork: age-selection.jpg
# caption: The years have shaped you

How old are you? Your age will affect your starting attributes and opportunities.

* [Young (18-25)] 
  ~ ageRange = "young"
  ~ age = 21
  -> background_selection

* [Prime (26-35)] 
  ~ ageRange = "prime" 
  ~ age = 30
  -> background_selection

* [Veteran (36-45)] 
  ~ ageRange = "veteran"
  ~ age = 40
  -> background_selection

=== background_selection ===
# artwork: background-selection.jpg
# caption: Your past has prepared you for this moment

What was your life before joining the army?

{ageRange == "young" :
  As a young man, you have energy but limited experience.
  - else if ageRange == "prime" -
  In your prime years, you balance energy with some life experience.
  - else -
  As a veteran, you bring wisdom but your body shows the wear.
}

* [Peasant Farmer] 
  ~ background = "peasant"
  ~ strength += 1
  ~ endurance += 1
  -> priority_selection

* [Town Merchant] 
  ~ background = "merchant"
  ~ charisma += 1
  ~ wits += 1
  -> priority_selection

* [Manor Retainer] 
  ~ background = "retainer"
  ~ strength += 1
  ~ charisma += 1
  -> priority_selection

* [Urban Militia] 
  ~ background = "militia"
  ~ agility += 1
  ~ wits += 1
  -> priority_selection

=== priority_selection ===
# artwork: priority-selection.jpg
# caption: Choose what matters most to you

Every soldier must choose their priorities. What do you value most?

You must assign points to three different priorities. Each choice affects your starting attributes.

{background == "peasant" :
  Your farming background gives you natural strength and endurance.
  - else if background == "merchant" -
  Your merchant experience has sharpened your mind and social skills.
  - else if background == "retainer" -
  Time in a manor has taught you both strength and diplomacy.
  - else -
  Militia service has trained your agility and tactical thinking.
}

* [Strength is most important]
  ~ priorities = ["strength", "agility", "endurance"]
  -> patron_selection

* [Agility is most important] 
  ~ priorities = ["agility", "wits", "charisma"]
  -> patron_selection

* [Wits are most important]
  ~ priorities = ["wits", "charisma", "luck"]
  -> patron_selection

* [Charisma is most important]
  ~ priorities = ["charisma", "luck", "wits"]
  -> patron_selection

=== patron_selection ===
# artwork: patron-selection.jpg
# caption: Choose who will command you

Your reputation has reached the ears of several commanders. Each offers different opportunities.

Based on your priorities ({priorities.join(", ")}), these commanders are interested in your service:

{priorities.includes("strength") :
  Your martial focus attracts the warrior leaders.
  - else if priorities.includes("wits") -
  Your tactical mind interests the strategic commanders.
  - else -
  Your balanced approach makes you appealing to various lords.
}

* [Sir James "The Reaver" de Looney (Free Company)]
  ~ patronId = "james_olooney"
  ~ strength += 1
  ~ agility += 1
  ~ morale -= 1
  ~ wealth += 2
  -> character_summary

* [Sir David de Montfort (Noble Household)]
  ~ patronId = "lord_david"
  ~ charisma += 1
  ~ morale += 1
  ~ wits += 1
  ~ wealth -= 2
  -> character_summary

* [Baron Caley of Tournai (Noble Household)]
  ~ patronId = "duke_caley"
  ~ wealth += 3
  ~ reputation += 1
  ~ morale -= 1
  ~ stress += 1
  -> character_summary

* [Count Charles "The Grim" of Suffolk (Noble Household)]
  ~ patronId = "count_charles"
  ~ strength += 1
  ~ endurance += 1
  ~ morale -= 1
  ~ stress += 1
  ~ wits -= 1
  -> character_summary

* [Ashkhan of the Mamluk Guard (Mercenary Company)]
  ~ patronId = "ashkhan"
  ~ agility += 1
  ~ wits += 1
  ~ reputation += 1
  -> character_summary

=== character_summary ===
# artwork: character-summary.jpg
# caption: Your character is ready

Your character is complete. Here is your summary:

**Name:** {characterName}
**Age:** {age} ({ageRange})
**Background:** {background}
**Patron:** {patronId}

**Final Stats:**
- Strength: {strength}
- Agility: {agility}
- Endurance: {endurance}
- Charisma: {charisma}
- Wits: {wits}
- Luck: {luck}
- Wealth: {EXTERNAL formatCurrency(wealth)}
- Morale: {morale}
- Stress: {stress}

{patronId == "james_olooney" :
  Sir James "The Reaver" welcomes you. "We'll make good money, but the fighting will be fierce."
  - else if patronId == "lord_david" -
  Sir David nods approvingly. "I value my men's lives. We'll fight smart, not hard."
  - else if patronId == "duke_caley" -
  Baron Caley barely acknowledges you. "Prove your worth, and you'll be rewarded."
  - else if patronId == "count_charles" -
  Count Charles grunts. "Another body for the meat grinder. Try to survive."
  - else -
  Ashkhan studies you carefully. "Your skills will serve us well. Welcome to the Guard."
}

Your military life begins now. The year is {gameState.year}, and the future awaits.

* [Begin your story]
  -> start
