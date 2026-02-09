EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)
EXTERNAL changeStat(stat, delta)
EXTERNAL hasItem(itemId)

== start
{showImage("artwork/standoff.jpg")}

You return to the town square where the merchant is still at his stall.

"Ah, you're back! Did you deliver the message?"

{if NOT hasItem("message_scroll"):
  "Yes, the guard received it. He said the matter is being handled."
  
  The merchant beams with relief. "Wonderful! You've done me a great service. Here's your payment as promised."
  
  {changeStat("wealth", 5)}
  {changeStat("reputation", 1)}
  {advanceTime(15)}
  
  "And a little extra for your promptness. You've earned a reputation as someone who gets things done around here."
  
  The merchant hands you a small pouch of coins. "If you ever need work, come see me first. I could use more reliable messengers."
  
  -> DONE
else:
  "I... haven't delivered it yet."
  
  The merchant's face falls. "Please hurry. The information in that scroll is time-sensitive. The castle gate is just up the hill - you can't miss it."
  
  * "I'll go right now."
    "Thank you! The guard is expecting you."
    -> DONE
    
  * "I'll get to it eventually."
    The merchant looks worried. "Please, make it soon. This is important."
    -> DONE
}
