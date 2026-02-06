# Artwork Assignment Evaluation Prompt

## Your task

You are evaluating a batch of **artwork assignments** made to the game **Man-at-Arms** (a browser-based roguelike set during the Hundred Years' War, 1337–1453). Artwork was added to many scenes that previously had none: each assigned scene now has an `artwork` path (e.g. `"artwork/filename.jpg"`) and an `artworkCaption` string.

Your job is to **review these changes** in `man-at-arms.html` and produce a short, structured evaluation report.

---

## What to evaluate

### 1. **Correctness**
- Every scene with `artwork:` should also have `artworkCaption:` (and vice versa where intended).
- Artwork paths must be exactly `"artwork/<filename>"` with the correct extension (e.g. `.jpg`, `.jpeg`). No typos, no wrong filenames.
- Cross-check that each referenced file exists in the `artwork/` directory (e.g. `artwork/battle-scene-1.jpg`, `artwork/bridgerain.jpg`). If you cannot list the directory, note “Assumed present” and list any names that look suspicious (e.g. wrong extension, odd casing).
- No broken JavaScript: commas, quotes, and object structure around `artwork` / `artworkCaption` must be valid.

### 2. **Thematic fit**
Using the intended usage from the original assignment guidelines (see “Assignment guidelines” below), check whether:
- **Battle/combat scenes** use battle-scene-*.jpg, battle-aftermath.jpg, or afterbattle.jpg (or similar) where appropriate.
- **River/ford crossings** use bridgerain.jpg (or a justified alternative).
- **Camp life / fire / rest** use campfire.jpg, drunkfire.jpg, or blacksmith.jpg as appropriate.
- **Naval/crossing** use naval-battle-*.jpg or the historical naval images where appropriate.
- **Siege** uses seige.jpg (or a justified alternative).
- **Looting/pillage** use looting.jpg, burninglooting.jpg, or unnamed.jpg as appropriate.
- **Supply/shortage** use supplyshortage.jpg.
- **Confrontations/tension** use standoff.jpg where appropriate.
- **Noble/ceremonial** use Vigiles_du_roi_Charles_VII_32.jpg where appropriate.

Flag any assignments that clearly contradict the scene’s theme (e.g. a river crossing using a naval battle image with no narrative justification).

### 3. **Caption quality**
For a sample of assigned scenes (at least 15–20, across different types), assess whether captions:
- Are **atmospheric** and match a McCarthy-esque, sparse, medieval tone.
- Are **concise** (roughly 5–15 words unless there’s good reason to be longer).
- Are **descriptive** and set the scene without stating the obvious (e.g. avoid “This is a battle”).
- Feel **period-appropriate** (Hundred Years’ War / medieval soldier experience).

Note 3–5 examples of strong captions and 2–3 that feel off (generic, too long, anachronistic, or tonally wrong).

### 4. **Coverage and consistency**
- Count (or estimate) how many scenes in `man-at-arms.html` now have `artwork` (and optionally how many total scene-like objects there are) so you can report approximate coverage (e.g. “X% of scenes have artwork”).
- Note whether high-visibility scenes (early game, major battles, key story beats) tend to have artwork.
- Check for obvious inconsistencies (e.g. one scene in a sequence with artwork and the next without, where both are similar in importance).

### 5. **Other issues**
- Any scene that has `artworkCaption` but no `artwork` (or the reverse) and clearly should have both.
- Duplicate or near-duplicate captions that might feel repetitive.
- Any assignment that could be offensive, anachronistic, or break immersion.

---

## Assignment guidelines (reference)

Use these as the intended mapping when judging thematic fit:

- **Battle** → battle-scene-*.jpg, battle-aftermath.jpg, afterbattle.jpg  
- **Naval/sea** → naval-battle-*.jpg, BattleofSluys.jpeg, Bataille_de_la_Rochelle.jpg  
- **Camp life** → campfire.jpg, drunkfire.jpg, blacksmith.jpg, market.jpg  
- **River crossing** → bridgerain.jpg  
- **March/travel** → march.jpg, Passages_faiz_oultre_mer_SEBASTIEN_MAMEROT_143r.jpg  
- **Church/religious** → monk.jpg  
- **Siege** → seige.jpg  
- **Looting/pillage** → looting.jpg, burninglooting.jpg, burninglooting2.jpg, unnamed.jpg  
- **Supply shortage** → supplyshortage.jpg  
- **Confrontation** → standoff.jpg  
- **Noble/ceremonial** → Vigiles_du_roi_Charles_VII_32.jpg  
- **Contract/signing** → signup.jpg  
- **Docks/harbor** → dock.jpg  
- **Death/assassination** → Assassinat_louis_orleans.jpg  
- **Character creation** → character-creation.jpg  
- **Map/strategy** → map.jpg  

Reuse of the same image across multiple scenes is acceptable when the theme fits.

---

## Output format

Please produce a report with the following sections (you can shorten or combine if needed):

1. **Summary** – 2–4 sentences on overall quality and any critical issues.
2. **Correctness** – Paths, syntax, and file existence; list any errors or doubts.
3. **Thematic fit** – Overall assessment; list any mismatches or questionable choices (scene name + artwork used).
4. **Caption quality** – Sample assessment with 3–5 good examples and 2–3 weak ones (scene name + caption).
5. **Coverage** – Approximate count/percentage and note on high-visibility coverage.
6. **Recommendations** – 3–5 concrete fixes or improvements (e.g. “Add artwork to scene X”, “Change caption for Y to …”, “Fix path for Z”).

If you cannot access the file system to verify `artwork/` contents, say so and base correctness only on path format and naming consistency.

---

## Files to use

- **Primary:** `man-at-arms.html` in this repository (search for `artwork:` and `artworkCaption:` to find all assignments).
- **Reference:** `ARTWORK_ASSIGNMENT_PROMPT.md` in this repository for full list of artwork files and guidelines.
- **Optional:** List the contents of the `artwork/` directory to verify filenames.

Evaluate only the artwork and caption assignments; do not change the game logic or narrative text unless you are explicitly asked to suggest caption rewrites in the Recommendations section.
