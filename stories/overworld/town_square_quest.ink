EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)
EXTERNAL addItem(itemId, quantity)
EXTERNAL hasItem(itemId)
EXTERNAL getItemCount(itemId)

== start
{showImage("artwork/march.jpg")}

You approach the bustling town square. A nervous-looking merchant waves you over.

"Ah, a man-at-arms! Just the person I need. I have an urgent message that must be delivered to the castle gate immediately. It's a matter of great importance!"

{advanceTime(15)}

The merchant continues, "I can't leave my stall, but you look trustworthy. Deliver this scroll to the guard at the castle gate, and I'll reward you handsomely."

* "I'll deliver your message."
  {addItem("message_scroll", 1)}
  The merchant hands you a sealed scroll. "Thank you! The guard at the castle gate is expecting it. Hurry now!"
  -> DONE

* "What's in it for me?"
  "I'll pay you 5 silver pieces for your trouble. It's not far, just to the castle gate."
  * "Accept payment."
    {addItem("message_scroll", 1)}
    The merchant counts out 5 silver pieces and presses them into your hand along with the scroll. "Godspeed, soldier!"
    -> DONE
  * "That's not enough."
    The merchant sighs. "Very well, 8 silver pieces, but that's my final offer."
    * "Accept."
      {addItem("message_scroll", 1)}
      You take the coins and scroll. "Thank you for your understanding."
      -> DONE
    * "Still refuse."
      The merchant shrugs. "Then I'll find someone else. Good day."
      -> DONE

* "I'm too busy."
  The merchant looks disappointed. "Very well. I'll find someone else."
  -> DONE
