// ============================================
// 00_arrival.ink - The Chevauchée Begins
// Landing in Normandy, 1346
// ============================================

EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL addHeat(amount)
EXTERNAL changeStat(stat, delta)
EXTERNAL addItem(itemId, qty)
EXTERNAL removeItem(itemId, qty)
EXTERNAL hasItem(itemId)
EXTERNAL showImage(imagePath)

VAR chapter = 1
VAR patronId = ""
VAR patronName = ""

-> arrival

=== arrival ===
#speaker:narrator
#portrait:none
#music:storm_theme

The crossing was hell.

Three days of storm-tossed seas, men retching over the rails, the constant fear of French ships appearing from the mist. But now you stand on French soil near the mouth of the Seine, the salt spray still fresh in your memory, the ground firm beneath your feet.

{showImage("artwork/arrival_storm.png")}

King Edward's host spreads across the dunes like a plague. Five thousand men, maybe more. Archers, men-at-arms, hobelars on light horses. The smoke of cooking fires rises in the damp morning air.

Your lord {patronName} summons you and the other leaders.

~ advanceTime(180)

-> patron_briefing

=== patron_briefing ===
#speaker:{patronName}
#portrait:patron_commanding

{ patronId == "james_olooney": -> patron_olooney }
{ patronId == "lord_david": -> patron_david }
{ patronId == "duke_caley": -> patron_caley }
{ patronId == "count_charles": -> patron_charles }
-> patron_generic

=== patron_olooney ===
"The Reaver" de Looney grins, showing teeth stained with wine. "God has delivered us to the richest dairy in Christendom. Normandy. Fat merchants. Plump villages. And the French king's army nowhere to be seen."

He leans close. The smell of garlic and ale is thick.

"Burn everything. Take everything. Leave nothing but ash and widows. This is how we get rich, lads. And if a few peasants object..."

He draws a finger across his throat.

* [Nod agreement] 
    #stat:patronFavor+2
    #stat:stress+1
    
    You match his grin. The men around you murmur approval. There will be plunder, and plenty of it.
    -> approach_choice

* [Ask about the King's orders]
    #stat:wits+1
    #stat:patronFavor-1
    
    "The King's orders?" Olooney laughs, sharp and cruel. "The King wants the French crown. We want their silver. The peasants want to keep their miserable lives. Only one of us will be satisfied, eh?"
    -> approach_choice

=== patron_david ===
Sir David de Montfort stands straighter than most third sons, his armor plain but well-maintained. His voice is soft, almost apologetic.

"We are here to secure the French crown for King Edward. The burning... it is regrettable but necessary. We must move quickly, avoid the main French forces. Speed saves lives."

He looks at each of you in turn.

"I will not order you to spare civilians. But I will remember those who show mercy. And those who delight in cruelty."

* [Promise to act with honor]
    #stat:patronFavor+2
    #stat:reputation+3
    
    You meet his eyes. He nods, something like relief crossing his face. There are good men in his command, men he can trust.
    -> approach_choice

* [Ask where the plunder goes]
    #stat:patronFavor-1
    #stat:wealth+5
    
    A shadow crosses his face. "Standard division. One third to the King, two thirds divided by rank and service." He pauses. "There will be silver enough for all, if we survive."
    -> approach_choice

=== patron_caley ===
Baron Caley of Tournai looks through you, not at you. A man planning battles already fought in his mind.

"The chevauchée. Scorched earth. We burn, we pillage, we provoke. King Philip must respond - he cannot let Normandy burn unanswered. When he moves, we strike."

He gestures toward the distant hills.

"Your lives are... acceptable losses. Your deaths, honorable. Do not expect me to mourn you, only to pay your widows. Now - who here knows how to ride down fleeing peasants?"

* [Claim experience in raiding]
    #stat:patronFavor+1
    #stat:reputation+1
    #stat:stress+1
    
    You describe a raid on the Welsh borders, embellishing freely. Caley listens, impassive, then nods once. Good enough.
    -> approach_choice

* [Remain silent]
    
    You say nothing. Caley's eyes linger on you for a moment, then move on. Silence is acceptable. Silence means obedience.
    -> approach_choice

=== patron_charles ===
Count Charles "The Grim" looks like a man who has seen too many winters and too many battles. His beard is grey, his eyes tired, but his voice carries the weight of command.

"Harfleur is five days' march. We burn everything between here and there. Every village. Every barn. Every field. The French must learn that English boots bring fire."

He drinks from a wineskin, wiping his mouth with a scarred hand.

"I've buried three hundred men in ten years of war. You'll either harden or die. Choose quickly."

* [Ask his advice for survival]
    #stat:wits+1
    #stat:patronFavor+1
    
    He studies you for a long moment. "Stay with the main body. Never lead a foraging party. Sleep with your boots on and your dagger in your hand. And when the French knights charge..."
    
    He smiles, joyless. "Pray."
    -> approach_choice

* [Assert your courage]
    #stat:strength+1
    #stat:patronFavor+1
    #stat:stress+1
    
    "Courage." He snorts. "Courage is what the dead had in common. But you'll do, soldier. You'll do."
    -> approach_choice

=== patron_generic ===
Your commander delivers the same speech given a thousand times before a thousand raids. Fire, steel, plunder. Victory and survival. The familiar words settle over camp like fog.

-> approach_choice

=== approach_choice ===
#speaker:narrator

Night falls. The army sprawls across the dunes, fifteen thousand fires burning. You sit apart, sharpening your blade, thinking of what comes.

{showImage("artwork/night_camp.png")}

The chevauchée will test you. Your nerve. Your conscience. Your luck. How will you face it?

* [Bold and aggressive - Strike fast, take risks]
    #setflag:approach_bold
    #stat:reputation+3
    #stat:stress+2
    
    Fortune favors the brave. Or so they say. The bold get rich or get dead, and you've always bet on yourself.
    -> first_march

* [Cautious and defensive - Stay safe, trust comrades]
    #setflag:approach_cautious
    #stat:morale+2
    #stat:stress-1
    
    Heroes die young. The survivors are those who know when to duck, when to hide, when to let others take the risks. Pride is expensive.
    -> first_march

* [Pragmatic and profit-focused - Take what you can]
    #setflag:approach_pragmatic
    #stat:wealth+5
    #stat:reputation-2
    
    War is business. The King makes politics, peasants make food, soldiers make money. You're here for your share, and if it costs a few French villages their harvest, that's commerce.
    -> first_march

* [Reluctant and regretful - Do what you must]
    #setflag:approach_relicant
    #stat:stress+3
    #stat:reputation-1
    
    You didn't choose this. You chose to eat, to survive, to send coin home. The killing... it stains. But so does starving.
    -> first_march

=== first_march ===
#speaker:narrator
#music:march_theme

Dawn breaks grey and humid. The army stirs, packs, forms into marching columns. You find your place, check your kit, and step onto French soil.

{advanceTime(360)}

The first village lies ahead. Smoke on the horizon could be morning cookfires - or signs of another English column already at work.

{showImage("artwork/village_approach.png")}

Your commander signals. Time to move.

-> END
