# Prompt for GPT 5.2 Image Model: Correct UK Map Dot Placement

## Task
Analyze the provided UK map image and provide corrected pixel-perfect coordinates for placing 8 clickable region markers (dots) on the map. The markers should be positioned at the geographic center of each historical English region.

## Current Implementation Details

The map markers are implemented using **CSS absolute positioning** with percentage-based coordinates. The positioning system works as follows:

### Positioning System
- **Container**: The map image is displayed in a container with `position: relative`
- **Markers**: Each marker is a circular button with `position: absolute`
- **Coordinate System**: Uses percentage-based `left` and `top` values (0-100%)
- **Centering**: Each marker uses `transform: translate(-50%, -50%)` to center the dot on its coordinate point
- **Marker Size**: Most markers are 24px × 24px circles; London is 28px × 28px (larger, with sword icon)

### Current Marker Positions

The markers are currently positioned at these percentage coordinates:

1. **Yorkshire** (North East England)
   - Current: `left: 60%`, `top: 38%`
   - Should be: Geographic center of Yorkshire region

2. **Lancashire** (North West England)
   - Current: `left: 46%`, `top: 38%`
   - Should be: Geographic center of Lancashire region

3. **Norfolk** (East Anglia)
   - Current: `left: 66%`, `top: 52%`
   - Should be: Geographic center of Norfolk region

4. **Essex** (Southeast, NE of London)
   - Current: `left: 58%`, `top: 54%`
   - Should be: Geographic center of Essex region

5. **London** (Southeast England) - **LARGER MARKER** (28px with sword icon ⚔)
   - Current: `left: 54%`, `top: 60%`
   - Should be: Geographic center of London (Thames River area)

6. **Kent** (Southeast corner)
   - Current: `left: 64%`, `top: 68%`
   - Should be: Geographic center of Kent region

7. **Somerset** (South West England)
   - Current: `left: 44%`, `top: 72%`
   - Should be: Geographic center of Somerset region

8. **Cornwall** (Far Southwest peninsula)
   - Current: `left: 32%`, `top: 82%`
   - Should be: Geographic center of Cornwall region

## What I Need From You

Please analyze the UK map image and provide:

1. **Corrected percentage coordinates** for each of the 8 regions in this format:
   ```
   Yorkshire: left: X%, top: Y%
   Lancashire: left: X%, top: Y%
   Norfolk: left: X%, top: Y%
   Essex: left: X%, top: Y%
   London: left: X%, top: Y%
   Kent: left: X%, top: Y%
   Somerset: left: X%, top: Y%
   Cornwall: left: X%, top: Y%
   ```

2. **Visual reference**: If possible, describe where each dot should be placed relative to:
   - Major cities (York, Manchester, Norwich, Colchester, London, Canterbury, Bath, Truro)
   - Geographic features (rivers, coastlines, mountain ranges)
   - County boundaries (if visible on the map)

3. **Notes on any adjustments needed**: If any regions need special consideration (e.g., if the map shows only England and not all of UK, or if certain regions are partially off-map)

## Technical Context

- The map image is displayed at `max-width: 800px` and scales responsively
- Markers must be clickable and visible on the map
- The coordinate system uses percentages so markers scale with the map
- Markers are centered on their coordinates using CSS transform
- All coordinates should be relative to the map image's bounding box (0% = top-left, 100% = bottom-right)

## Historical Context

This is for a game set during the Hundred Years' War (1337-1453), so the regions should reflect medieval English geography. Focus on the geographic centers of these historical regions rather than modern administrative boundaries.

---

**Please provide the corrected coordinates in a clear, structured format that I can directly copy into the code.**
