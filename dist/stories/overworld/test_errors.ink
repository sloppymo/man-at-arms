EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)
EXTERNAL getPlayerReputation()
EXTERNAL modifyRelation(characterId, change)

// Test error handling scenarios
{showImage("")}

You try to show an invalid image.

{advanceTime(-10)}

You attempt to travel back in time, which fails.

{consumeSupply("", 5)}

You try to consume nothing.

{consumeSupply("food", "invalid")}

You try to consume an invalid amount.

{getPlayerReputation()}

Your reputation is {getPlayerReputation()}.

{modifyRelation("", 5)}

You try to modify a relation with no character.

* Continue anyway
  -> continue_test

* End test
  -> end_test

=== continue_test ===
The story continues despite errors.
-> DONE

=== end_test ===
The test is complete.
-> DONE
