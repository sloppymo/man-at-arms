// ============================================
// Simple Forest Test - Basic Ink Story
// ============================================

=== forest_test ===
#speaker:narrator
#music:forest_ambient

You venture into the dense forest. The trees tower above you, and the path ahead is uncertain.

* Continue deeper into the forest
    #speaker:narrator
    #wait:1.5
    
    An hour passes as you traverse the undergrowth.
    The forest grows thicker around you.
    
    * Follow the game trail
        #speaker:narrator
        #music:mystery_theme
        
        You discover a small clearing with a crystal spring.
        The water looks pure and refreshing.
        
        * Drink from the spring
            #stat:health+10
            #speaker:narrator
            
            The water revitalizes you. You feel refreshed and ready for adventure.
            -> END
            
        * Fill your waterskin
            #item:add:fresh_water
            #speaker:narrator
            
            You fill your waterskin with the pure spring water.
            This might be useful later.
            -> END
            
    * Return to the main path
        #speaker:narrator
        #music:overworld_ambient
        
        You decide to stick to the safer route.
        Sometimes discretion is the better part of valor.
        -> END

* Rest by a large oak tree
    #speaker:narrator
    #wait:2.0
    
    You find a comfortable spot beneath an ancient oak.
    The forest seems peaceful here.
    
    * Take a short nap
        #stat:fatigue-20
        #speaker:narrator
        
        You rest for an hour and wake refreshed.
        The forest seems less threatening now.
        -> END
        
    * Check your supplies
        #speaker:narrator
        
        You inventory your provisions. Everything seems to be in order.
        It's always wise to be prepared.
        -> END

* Leave the forest
    #speaker:narrator
    #music:overworld_ambient
    
    You decide the forest is not worth the risk today.
    There will be other opportunities for adventure.
    -> END

=== END ===
#speaker:narrator
#music:overworld_ambient

Your forest journey concludes...

-> DONE
