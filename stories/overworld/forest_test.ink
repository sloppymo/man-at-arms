EXTERNAL advanceTime(minutes)
EXTERNAL getSupplies()
EXTERNAL consumeSupply(type, amount)
EXTERNAL showImage(imagePath)

{showImage("artwork/test.png")}

You venture into the dense forest. The trees tower above you, and the path ahead is uncertain.

{advanceTime(60)}

An hour passes as you traverse the undergrowth.

Current supplies: {getSupplies()}

{consumeSupply("food", 1)}
