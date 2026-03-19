# Session Work Log — Map System, UI Polish, and Landing Page

## Overview

This session covered four areas: building the facility map from scratch, adding user-reported occupancy, consolidating the color palette, and redesigning the landing page feature section as a LOGIC acronym.

---

## 1. Facility Map — Full Build

Replaced the placeholder `map.html` inline script with a modular vanilla JS system split across six files. The architecture follows a unidirectional data loop: **event → setState → render → DOM**. Nothing touches the DOM outside the three render functions.

### File Structure Created

```
frontend/
├── js/map/
│   ├── data.js       — ZONES store, FLOORS config, GROUP_COLORS
│   ├── state.js      — state object, setState, registerRender, derived getters
│   ├── simulate.js   — seedStatus (one-time random seed on load)
│   ├── render.js     — renderMap(), renderPanel(), renderTooltip()
│   └── events.js     — named handlers + attachEvents() wiring
└── css/
    └── map.css       — all map-specific styles, scoped selectors
```

### Data Contract (`data.js`)

- **18 zones** across two floors (15 on Main Floor, 3 on 2nd Floor)
- Each zone has: `label`, `floor`, `group`, `meta` (capacity, equipment, hours), `ui` (gridArea, icon, youAreHere), `status`
- **5 group types** with accent colors: `fitness`, `aquatics`, `courts`, `recreation`, `services`
- **FLOORS** object holds CSS `grid-template-areas`, `gridTemplateColumns`, `gridTemplateRows` per floor — applied via JS, not CSS variables (browsers do not support `var()` in `grid-area`)

### State Contract (`state.js`)

```js
const state = {
  activeZone:  null,
  hoveredZone: null,
  activeFloor: 1,
  panelOpen:   false,
};
```

Circular import between `state.js` and `render.js` was avoided using a `registerRender(fn)` callback. The bootstrap in `map.html` calls `registerRender(render)` before the first paint.

### Render Contract (`render.js`)

- `renderMap()` — builds zone cards, sets `el.style.gridArea`, applies `--accent`/`--accent-light` CSS vars per card, handles dimming via `.has-active` on the grid container
- `renderPanel()` — populates side panel with equipment, hours, capacity bar, status badge; applies group accent stripe
- `renderTooltip()` — follows cursor (updated live on `mousemove` without full re-render); hidden when panel is open

### Event Contract (`events.js`)

All handlers are named functions. Listeners are delegated to the grid or attached once via `attachEvents()`.

```js
onZoneClick(key)   → setState({ activeZone: key, panelOpen: true })
onZoneHover(key)   → setState({ hoveredZone: key })
onZoneLeave()      → setState({ hoveredZone: null })
onPanelClose()     → setState({ activeZone: null, panelOpen: false })
onFloorChange(n)   → setState({ activeFloor: n, activeZone: null, panelOpen: false })
```

### Key CSS Decisions (`map.css`)

- Dark map surface with dot-grid texture (`background-image: radial-gradient`)
- Zone card dimming via `.map-grid.has-active .zone-card:not(.active) { opacity: 0.28 }` — on the grid container, not individual cards
- "You Are Here" pulsing dot via `::after` animation on `.zone-card.you-are-here`
- Side panel slides in from right (`translateX(100%)` → `translateX(0)`) with spring curve
- On screens ≤ 680px the panel slides up from the bottom instead

### SRS Compliance Notes

- `simulate.js` runs `seedStatus()` **once on load only** — no `setInterval`, no auto-refresh
- Status values are labeled "estimated — not live data" in the panel
- Map has no backend dependency — fully static and informational
- Floor switcher kept since the venue has two floors

---

## 2. User Zone Reporting (localStorage)

Added a "Report Occupancy" section to the side panel allowing the user to mark any zone as Open, Moderate, or Busy. Reports persist across page refreshes and expire after 4 hours.

### Changes

**`simulate.js`** — added three exports:
- `loadSavedReports()` — reads `sweatlogic-report-{key}` entries from localStorage, skips entries older than 4 hours, applies valid ones over the random seed
- `setZoneReport(key, status)` — writes `{ status, timestamp }` to localStorage, updates `ZONES[key].status` in memory
- `getSavedReport(key)` — returns the saved entry or null if missing/expired

**`render.js`** — `renderPanel()` updated to:
- Show three report buttons (Open / Moderate / Busy) at the bottom of the panel
- Highlight the active report button with `.is-reported` class
- Switch the status note from "estimated — not live data" to "You reported this · Xm ago" when a user report exists
- Wire button clicks inline after innerHTML is set

**`map.css`** — added `.report-buttons`, `.report-btn`, and `.report-btn.is-reported` styles. Each status variant (empty/moderate/busy) has a distinct border and text color matching the status token.

**`map.html`** bootstrap updated:
```js
registerRender(render);
seedStatus();
loadSavedReports();  // ← added
attachEvents();
render();
```

Zone cards with a saved user report get a `.user-reported` class (dashed border) to distinguish them from estimated ones.

---

## 3. Color Palette Consolidation

### Problem

`map.css` did not use any CSS custom properties from `styles.css`. The moderate status color existed as two different hex values (`#f39c12` in map.css vs `#f5a623` in data.js). Legend dot colors in `map.html` were hardcoded inline via `style=""` attributes.

### Fix

**`styles.css` — 4 new tokens added to `:root`:**
```css
--status-empty:    #2ecc71;
--status-moderate: #f5a623;
--status-busy:     #e74c3c;
--map-surface:     #0c1610;
```

**`map.css`** — all hardcoded status and surface colors replaced with tokens:
- `#2ecc71` → `var(--status-empty)`
- `#f39c12` and `#f5a623` → `var(--status-moderate)` (conflict resolved)
- `#e74c3c` → `var(--status-busy)`
- `#0c1610` → `var(--map-surface)`

**`map.css`** — added two legend dot classes to replace inline styles:
```css
.legend-dot.courts   { background: var(--zone-green); }
.legend-dot.services { background: #8b9aaa; }
```

**`map.html`** — removed inline `style="background:#22c55e"` and `style="background:#8b9aaa"` from legend dots, replaced with `.courts` and `.services` classes.

---

## 4. Brand Mark — Venn Diagram

Replaced the two diagonal bar pseudo-elements in `.brand-mark` with a Venn diagram (two overlapping circles) using `mix-blend-mode: multiply`.

```css
.brand-mark::before { background: rgba(11, 143, 42, 0.68); }  /* green, left */
.brand-mark::after  { background: rgba(15, 138, 183, 0.68); } /* blue, right */
```

The overlap creates a dark teal intersection on the white background, representing logical intersection (AND). On the dark CTA band at the page bottom, `mix-blend-mode` is reset to `normal` with semi-transparent white circles so the mark stays visible.

---

## 5. LOGIC Mnemonic Section (Landing Page)

Replaced the 4-card feature grid (S / P / M / G chips) with a stacked acronym section where each letter of LOGIC maps to a page in the app.

| Letter | Word | Definition | Links To |
|---|---|---|---|
| L | Log | Record every workout — type, duration, notes | Dashboard |
| O | Optimize | Smart workout plans by body part, goal, level | Workout |
| G | Guide | Navigate the UNT Rec Center floor by floor | Map |
| I | Insights | Streaks, weekly totals, workout trends | Progress |
| C | Customize | Set fitness goal, experience level, unit preference | Settings |

### Layout

Each row is a full `<a>` element using a 3-column grid: large letter / body text / page tag. Hovering slides the row right with a green inset border, scales the letter up slightly, and animates the page tag.

### Animation Fix

The rows initially had `data-animate="slide-left"` set in HTML. The `[data-animate]` CSS rule starts all such elements at `opacity: 0`, but `main.js` only registers elements matching selectors in its `motionGroups` array with the IntersectionObserver — `.logic-row` was not listed, so the rows stayed invisible.

**Fix:** removed manual `data-animate` attributes from HTML, added `.logic-stack .logic-row` to the `slide-left` group in `main.js`:

```js
selector: '...existing selectors..., .logic-stack .logic-row',
animation: 'slide-left',
step: 100,
```

The motion system now assigns staggered delays automatically and the observer reveals each row as it scrolls into view.

---

## Files Modified This Session

| File | Change |
|---|---|
| `frontend/map.html` | Full rewrite — module bootstrap, new HTML structure |
| `frontend/js/map/data.js` | Created — ZONES, FLOORS, GROUP_COLORS |
| `frontend/js/map/state.js` | Created — state, setState, registerRender, derived getters |
| `frontend/js/map/simulate.js` | Created → updated with loadSavedReports, setZoneReport, getSavedReport |
| `frontend/js/map/render.js` | Created → updated with report buttons and timeAgo helper |
| `frontend/js/map/events.js` | Created — all event handlers, attachEvents |
| `frontend/css/map.css` | Created → updated with token colors and report button styles |
| `frontend/css/styles.css` | Added 4 CSS tokens, new LOGIC section styles, Venn brand mark |
| `frontend/index.html` | Replaced feature grid with LOGIC acronym section |
| `frontend/js/main.js` | Added `.logic-stack .logic-row` to motionGroups slide-left selector |
