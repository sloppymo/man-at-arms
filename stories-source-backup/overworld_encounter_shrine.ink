// ------------------------------------------------------------
// OVERWORLD ENCOUNTER DEMO (portraits + branching + skill checks)
// Conventions used as tags (read via story.currentTags):
//   speaker:<NameId>
//   pl:<portraitPath>   (portrait left)
//   pr:<portraitPath>   (portrait right)
//   poseL:<poseId>      poseR:<poseId>
//   bg:<backgroundPath>
//   sfx:<soundId>
//   mode:<uiMode>       (e.g., overworld / ink / combat)
//   intent:<token>      (e.g., startCombat:peasant_mob)
// ------------------------------------------------------------

// Persistent story vars (these persist across the run / save system)
VAR met_old_man = false
VAR old_man_goodwill = 0
VAR last_margin = 0

// ---- EXTERNALS (bind these in JS via inkjs BindExternalFunction) ----
// rollCheck returns an integer margin: >=0 success, -1/-2 partial, <=-3 fail
EXTERNAL rollCheck(skill, dc)

// Optional: hook your existing game systems
EXTERNAL addResource(resourceId, amount)          // e.g. ("food", 1)
EXTERNAL applyOverworldCost(minutes, heatDelta, fatigueDelta)
EXTERNAL startCombat(encounterId)                 // e.g. ("peasant_mob")
EXTERNAL setWorldFlag(flagId, value)              // e.g. ("shrine_robbed", 1)

// Entry
=== start ===
-> overworld_shrine


// ------------------------------------------------------------
// Encounter: roadside shrine on the forest hex map
// ------------------------------------------------------------
=== overworld_shrine ===

#mode:ink
#bg:maps/hex_forest_region.png
#sfx:wind_gust

The forest rises and falls like a dark sea of needles and wet stone.
A roadside shrine sits crooked at the edge of the path—wax stubs, damp flowers, a cracked saint.

~ applyOverworldCost(15, 0, 1)

{met_old_man:
    A familiar figure waits beside the shrine, hands folded, watching you.
- else:
    Someone is already here: an old peasant in patched wool, eyes bright with worry.
}

#speaker:OldMan
#pl:portraits/old_man.png
#poseL:pleading
"Serjeant… if you are one. Please. A word."

* [Forage first. Keep distance.] -> forage_first
* [Hear him out.] -> hear_him_out
* [Drive him off.] -> drive_him_off


// ------------------------------------------------------------
// Branch: forage first
// ------------------------------------------------------------
=== forage_first ===

#speaker:Narration
#sfx:brush_rustle
You step off the path and work the undergrowth for anything worth carrying.

~ last_margin = rollCheck("Forage", 12)

{
- last_margin >= 0:
    #sfx:found
    You find winter berries and a strip of dry kindling tucked beneath a fallen pine.
    ~ addResource("food", 1)
    ~ old_man_goodwill = old_man_goodwill + 1
- last_margin == -1 or last_margin == -2:
    You find something—barely. Enough to chew, not enough to feel saved.
    ~ addResource("food", 1)
- else:
    #sfx:branch_snap
    A branch snaps under your boot. The forest seems to listen.
    ~ applyOverworldCost(0, 5, 0) // small heat spike
}

#speaker:OldMan
#poseL:anxious
"You've the look of men who live by choices. Will you make one that spares us?"

-> hear_him_out


// ------------------------------------------------------------
// Branch: hear him out
// ------------------------------------------------------------
=== hear_him_out ===

~ met_old_man = true

#speaker:OldMan
#poseL:pleading
"My daughter's fever won't break. The village has nothing left—no grain, no coin, no mercy."
"They say soldiers pass through like weather. I prayed this shrine would catch one kind heart."

* [Give food. (Lose 1 food)] -> give_food
* [Offer help, but ask questions first.] -> questions
* [Take what you can. "Pay" for your protection.] -> extort
* [Refuse. Move on.] -> refuse


=== give_food ===

#speaker:Narration
You hand over what you can spare, and he clutches it like a relic.

~ addResource("food", -1)
~ old_man_goodwill = old_man_goodwill + 2
~ setWorldFlag("old_man_helped", 1)

#speaker:OldMan
#poseL:relief
"God keep you. If you keep to the creekline, you'll miss the patrol road."

-> wrap_up


=== questions ===

#speaker:Sergeant
#pr:portraits/sergeant.png
#poseR:stern
"Who's hunting you? And why should my men bleed for it?"

~ last_margin = rollCheck("Insight", 11)

{
- last_margin >= 0:
    #speaker:OldMan
    #poseL:urgent
    "A mounted patrol. Not yours. Foreign men with bright harness."
    "They circle the village when the smoke rises."
    ~ setWorldFlag("patrol_risk_known", 1)
- else:
    #speaker:OldMan
    #poseL:evasive
    "Just… men. Boots and steel. Isn't that always the answer?"
}

* [Help anyway.] -> give_food
* [Refuse.] -> refuse


=== extort ===

#speaker:Sergeant
#poseR:hard
"You want mercy? Then buy it."

~ last_margin = rollCheck("Intimidation", 12)

{
- last_margin >= 0:
    #speaker:OldMan
    #poseL:broken
    He nods fast, terrified, and pulls a small coin from his sock-wrapped ankle.
    ~ addResource("coin", 1)
    ~ applyOverworldCost(0, 8, 0) // heat rises—word spreads
    ~ setWorldFlag("shrine_robbed", 1)

    #speaker:Narration
    The shrine feels colder after.
    -> wrap_up

- else:
    #speaker:OldMan
    #poseL:defiant
    "No. Not again. Not to you."

    #sfx:shout
    He screams—loud enough to carry.

    #mode:combat
    #intent:startCombat:peasant_mob
    ~ startCombat("peasant_mob")

    -> wrap_up
}


=== drive_him_off ===

#speaker:Sergeant
#pr:portraits/sergeant.png
#poseR:stern
"Go. Before my men mistake you for a spy."

~ last_margin = rollCheck("Presence", 10)

{
- last_margin >= 0:
    #speaker:OldMan
    #poseL:frightened
    He backs away, stumbling, and vanishes into the trees.
- else:
    #speaker:OldMan
    #poseL:angry
    "May your boots fill with water and never dry."
    ~ applyOverworldCost(0, 3, 0)
}

-> wrap_up


=== refuse ===

#speaker:Narration
You leave him to his prayers and the wet wind.

~ applyOverworldCost(0, 2, 0)

-> wrap_up


=== wrap_up ===

#speaker:Narration
#mode:overworld
The shrine falls behind you. The hexes ahead don't care what you chose—only what it cost.

-> DONE



// ------------------------------------------------------------
// OPTIONAL FALLBACKS (for Inky preview).
// If your runtime binds the EXTERNALs, these won't be used.
// ------------------------------------------------------------

=== function rollCheck(skill, dc) ===
~ return 0

=== function addResource(resourceId, amount) ===
~ return 0

=== function applyOverworldCost(minutes, heatDelta, fatigueDelta) ===
~ return 0

=== function startCombat(encounterId) ===
~ return 0

=== function setWorldFlag(flagId, value) ===
~ return 0
