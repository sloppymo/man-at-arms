// ------------------------------------------------------------
// FOREST ENCOUNTER TEST
// ------------------------------------------------------------

EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)

== forest_test

You venture into the dense forest. The trees tower above you, and the path ahead is uncertain.

{advanceTime(60)}

An hour passes as you traverse the undergrowth.

Current supplies: {getSupplies()}

{consumeSupply("food", 1)}

-> END


// ------------------------------------------------------------
// FALLBACK FUNCTIONS (for Inky preview / when externals aren't bound)
// ------------------------------------------------------------

=== function advanceTime(minutes) ===
~ return 0

=== function getSupplies() ===
~ return "none"

=== function consumeSupply(type, amount) ===
~ return 0
