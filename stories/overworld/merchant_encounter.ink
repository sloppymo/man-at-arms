// ============================================
// Merchant Encounter - Demonstrating Tag Conventions
// Shows how writers can use standardized tags
// ============================================

=== merchant_encounter ===
#speaker:merchant
#portrait:merchant_neutral
#music:market_theme

Well met, traveler! I have goods from across the realm. What catches your eye?

* What do you have for sale?
    #speaker:merchant
    #portrait:merchant_happy
    #sfx:coin
    
    Excellent choice! I have:
    - Fine steel weapons (+5 strength)
    - Healing potions (+10 health)
    - Rare spices (+2 charisma)
    
    * Buy the steel weapon [50 gold]
        #stat:wealth-50
        #stat:strength+5
        #item:add:steel_sword
        #relationship:merchant+5
        #sfx:purchase
        
        A fine purchase! May it serve you well.
        -> END
        
    * Buy healing potion [20 gold]
        #stat:wealth-20
        #item:add:healing_potion
        #sfx:potion
        
        Wise choice for a traveler. Stay safe!
        -> END
        
    * Just browsing
        #speaker:merchant
        #portrait:merchant_neutral
        
        Of course, take your time. Let me know if you need anything.
        -> merchant_encounter

* Any news from the road?
    #speaker:merchant
    #portrait:merchant_neutral
    #wait:2.0
    
    Indeed! There are troubling rumors:
    - Bandits have been seen on the northern road
    - The king is offering rewards for monster sightings
    - A mysterious plague affects the eastern villages
    
    * Tell me more about the bandits
        #speaker:merchant
        #portrait:merchant_worried
        #setflag:knows_about_bandits=true
        #quest:start:bandit_trouble
        
        Be careful! They travel in groups of 5-6, well-armed.
        Many merchants have lost their wares to them.
        
        * I'll handle them (strength check)
            #if:strength>=15
            #speaker:merchant
            #portrait:merchant_impressed
            #relationship:merchant+10
            #stat:reputation+5
            
            A brave warrior! The realm needs more like you.
            Here, take this as thanks:
            #item:add:merchant_token
            -> END
            
        * Maybe I should avoid them
            #speaker:merchant
            #portrait:merchant_relieved
            #relationship:merchant+5
            
            Wise decision. Live to fight another day, I say.
            -> END
            
    * What about the monster rewards?
        #speaker:merchant
        #portrait:merchant_excited
        #setflag:knows_about_bounties=true
        
        The king's bounty hunters have made fortunes! 
        Goblins, wolves, even dragons have been spotted.
        #quest:start:bounty_hunter
        -> END

* I'm just passing through.
    #speaker:merchant
    #portrait:merchant_neutral
    #music:overworld_ambient
    
    Safe travels, then! May the roads be kind to you.
    #relationship:merchant+1
    -> END

// Alternative encounter if player has high reputation
=== merchant_encounter_vip ===
#speaker:merchant
#portrait:merchant_excited
#sfx:bell

Ah! A renowned warrior! Your reputation precedes you.
Please, accept this gift as a token of respect.

#item:add:merchant_discount_token
#relationship:merchant+20
#stat:reputation+10

I offer you my finest wares at half price!
-> merchant_encounter

// Combat encounter if bandit flag is set
=== bandit_ambush ===
#speaker:bandit_leader
#portrait:bandit_leader_cruel_smile
#music:combat_theme
#sfx:draw_weapon

Well well, what have we here? A lone traveler with heavy pockets!

* Fight them!
    #scene:combat
    #setflag:in_combat=true
    #anim:shake
    
    You draw your weapon and prepare for battle!
    -> COMBAT_SYSTEM
    
* Try to intimidate them
    #if:strength>=12
    #speaker:bandit_leader
    #portrait:bandit_leader_neutral
    
    *Impressive* You've got spirit. Maybe we'll let you pass...
    But only if you leave us a "donation".
    
    * Pay them off [30 gold]
        #stat:wealth-30
        #relationship:bandit_leader-10
        #setflag:paid_off_bandits=true
        
        Smart move. Get lost!
        -> END
        
    * Refuse and fight
        #scene:combat
        #setflag:in_combat=true
        
        Fool! You'll regret this!
        -> COMBAT_SYSTEM
        
* Beg for mercy
    #speaker:bandit_leader
    #portrait:bandit_leader_laughing
    #sfx:laughter
    
    Pathetic! Take everything they have!
    #stat:wealth-100
    #item:remove:all
    #relationship:bandit_leader-20
    
    Don't come back to these roads!
    -> END

// Ending tags
=== END ===
#music:overworld_ambient
#speaker:narrator

The encounter concludes, but your journey continues...

-> DONE
