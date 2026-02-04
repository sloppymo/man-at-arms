# 5 Skirmishes Play Pass Checklist

## Setup
- [ ] Start new game (or use existing save)
- [ ] Equip mail if testing mail build
- [ ] Note starting meters: Exertion=___, Wear=___, Morale=___

## Play Pass Instructions

Play **5 skirmishes in a row** naturally (no forcing, no auto-skip). Mix strategies:
- Some Press, some Hold, some Drive
- Sometimes Skip timing, sometimes try for +2
- Let campfires appear naturally

## Track Each Skirmish

### Skirmish 1
- [ ] Variant: Roadside / Mud / Lane
- [ ] Choice: Press / Hold / Drive
- [ ] Tempo: Skip / +0 / +1 / +2
- [ ] Outcome: Success / Partial / Failure
- [ ] Costs: Exertion +___, Wear +___, Morale ___
- [ ] After: Exertion=___, Wear=___, Morale=___
- [ ] Campfire appeared? Yes / No (Micro / Full)

**Notes:**
- Did Tempo Strike feel annoying or mandatory?
- Did you feel forced to use it?

---

### Skirmish 2
- [ ] Variant: Roadside / Mud / Lane
- [ ] Choice: Press / Hold / Drive
- [ ] Tempo: Skip / +0 / +1 / +2
- [ ] Outcome: Success / Partial / Failure
- [ ] Costs: Exertion +___, Wear +___, Morale ___
- [ ] After: Exertion=___, Wear=___, Morale=___
- [ ] Campfire appeared? Yes / No (Micro / Full)

**Notes:**
- How's the meter economy feeling?
- Are you needing to use "Tend Kit" every campfire?

---

### Skirmish 3
- [ ] Variant: Roadside / Mud / Lane
- [ ] Choice: Press / Hold / Drive
- [ ] Tempo: Skip / +0 / +1 / +2
- [ ] Outcome: Success / Partial / Failure
- [ ] Costs: Exertion +___, Wear +___, Morale ___
- [ ] After: Exertion=___, Wear=___, Morale=___
- [ ] Campfire appeared? Yes / No (Micro / Full)

**Notes:**
- Is mail wear spiraling too fast?
- Are micro campfires showing up at a good rate?

---

### Skirmish 4
- [ ] Variant: Roadside / Mud / Lane
- [ ] Choice: Press / Hold / Drive
- [ ] Tempo: Skip / +0 / +1 / +2
- [ ] Outcome: Success / Partial / Failure
- [ ] Costs: Exertion +___, Wear +___, Morale ___
- [ ] After: Exertion=___, Wear=___, Morale=___
- [ ] Campfire appeared? Yes / No (Micro / Full)

**Notes:**
- Any routing issues or bounce loops?
- Does Tempo Strike feel like a clutch tool or a chore?

---

### Skirmish 5
- [ ] Variant: Roadside / Mud / Lane
- [ ] Choice: Press / Hold / Drive
- [ ] Tempo: Skip / +0 / +1 / +2
- [ ] Outcome: Success / Partial / Failure
- [ ] Costs: Exertion +___, Wear +___, Morale ___
- [ ] After: Exertion=___, Wear=___, Morale=___
- [ ] Campfire appeared? Yes / No (Micro / Full)

**Notes:**
- Overall feel: Is the loop fun or tedious?
- Would you want to play more or is it getting repetitive?

---

## Final Assessment

### Meter Economy
- [ ] Wear trend: Spiral / Manageable / Too Easy
- [ ] Exertion trend: Spiral / Manageable / Too Easy
- [ ] Recovery rate: Too Slow / Just Right / Too Fast
- [ ] "Tend Kit" frequency: Every campfire / Sometimes / Rarely

### Tempo Strike Feel
- [ ] Feels: Optional / Mandatory / Annoying / Fun
- [ ] Skip rate: Always / Sometimes / Never
- [ ] +2 bonus: Worth the exertion cost? Yes / No / Depends

### Campfire Cadence
- [ ] Micro campfires: Too Frequent / Just Right / Too Rare
- [ ] Full campfires: Too Frequent / Just Right / Too Rare
- [ ] Overall frequency: Too Many / Just Right / Too Few

### Routing & Stability
- [ ] Any bounce loops? Yes / No
- [ ] Any unexpected scene transitions? Yes / No
- [ ] Any UI oddities? Yes / No

### Overall Feel
- [ ] Loop feels: Fun / Tedious / Balanced / Needs Tuning
- [ ] Would play more: Yes / No / Maybe
- [ ] Biggest issue (if any): _________________________

---

## Console Commands for Tracking

After each skirmish, you can check state:
```javascript
// Check current meters
console.log('Exertion:', gameState.exertion, 'Wear:', gameState.wear, 'Morale:', gameState.stats.morale);

// Check last skirmish data
console.log('Last skirmish:', gameState.lastSkirmish);

// Check campfire state
console.log('Campfire mode:', gameState.campfire?.mode, 'Cooldown:', gameState.campfire?.lastInsertedAtIndex);
```

---

## What to Report

After completing the play pass, report:

1. **Meter trends** - Did wear/exertion spiral or stay manageable?
2. **Tempo Strike feel** - Optional tool or mandatory chore?
3. **Campfire frequency** - Too many, too few, or just right?
4. **Any issues** - Routing problems, UI oddities, balance concerns
5. **Overall assessment** - Fun loop or needs tuning?
