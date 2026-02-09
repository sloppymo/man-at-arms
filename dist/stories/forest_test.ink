== forest_test ==

You venture into the dense forest. The trees tower above you, and the path ahead is uncertain.

*   Continue your journey
    -> journey_continue

=== journey_continue ===

An hour passes as you traverse the undergrowth.

{advanceTime(60)}

Current supplies: {getSupplies()}

{consumeSupply("food", 1)}

The forest path ahead splits into two directions.

*   Take the left path
    -> left_path
    
*   Take the right path
    -> right_path

=== left_path ===

You follow the left path deeper into the forest. The trees become thicker and the air grows cooler.

*   Continue exploring
    -> END

=== right_path ===

You take the right path and find a small clearing with a stream.

*   Rest by the stream
    -> END

-> END
