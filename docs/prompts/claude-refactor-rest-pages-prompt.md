# Claude Refactor Prompt For Remaining Static Pages

Use this document to refactor the remaining plain HTML/CSS/JS pages in `frontend/` so they move closer to the richer UI reference while staying within the current stack and backend contracts.

Important constraint:
- The final implementation must remain plain HTML, CSS, and JavaScript.
- Do not use React, Next.js, TypeScript, JSX, component libraries, or build tooling.
- Keep existing JS hooks and IDs unless there is a very strong reason to change them.

## Context

The homepage has already been refactored and is now visually close enough to the target direction.

The remaining pages that still need to be brought closer to the richer reference are:
- `frontend/dashboard.html`
- `frontend/workout.html`
- `frontend/progress.html`
- `frontend/settings.html`
- `frontend/map.html`

These pages should reuse the current shared shell and styling from:
- `frontend/css/styles.css`

They should continue working with the current backend/API setup and existing static JS files:
- `frontend/js/dashboard.js`
- `frontend/js/workout.js`
- `frontend/js/progress.js`
- `frontend/js/settings.js`

## Screenshot-Based Visual References

These notes summarize the screenshots provided during review and should be treated as the target direction for the remaining pages.

### 1. Dashboard Reference

Visual characteristics:
- large top intro section with strong title hierarchy
- better use of cards and stat summaries
- more intentional spacing between sections
- stronger visual hierarchy than the current plain dashboard
- not just two empty cards, but a dashboard that feels like a real product screen

Target ideas to bring over:
- summary/stat cards across the top
- cleaner recent activity section
- better content density and spacing
- maintain green/blue/white palette

### 2. Workout Page Reference

Visual characteristics:
- two-column layout
- left panel for controls and workout setup
- right panel for generated plan/output area
- structured sections for target area, goal, and experience level
- selection controls look like cards or chips rather than plain form fields
- “Generate Workout Plan” CTA is visually prominent

Target ideas to bring over:
- separate “input/configuration” from “generated plan”
- convert current plain form into richer grouped sections
- keep recommendation logic/backend flow aligned with current contracts

### 3. Progress Page Reference

Visual characteristics:
- top stat cards for total workouts, duration, streak, average duration
- clear section for workout breakdown
- calendar/history area with stronger visual structure
- active navigation state feels more intentional
- page feels data-rich and not like an empty placeholder

Target ideas to bring over:
- add top summary cards
- add workout breakdown section
- make calendar/history feel like a real progress dashboard
- keep it tied to workout history, not fake endpoints

### 4. Settings Page Reference

Visual characteristics:
- clearly separated backend-safe fields and UI-only/planned fields
- badges/labels like “UI Only”
- better spacing and grouping
- settings page feels like a real profile/preferences interface instead of a tiny form

Target ideas to bring over:
- keep backend-safe section for `username` and `unit`
- optionally include additional planned fields, but clearly mark them as local/demo/UI-only
- stronger card structure and better form grouping

### 5. Map Page Reference

Visual characteristics:
- actual page layout with map panel and side information panel
- labeled zones
- legend and contextual info
- building hours / supporting details card
- map interactions are static and informative, not live navigation

Target ideas to bring over:
- structured split layout
- map panel + detail panel
- labeled zones and legend
- supporting information card(s)

## Current Problems To Fix

The remaining non-home pages are still too simple compared to the target design because they:
- rely on a basic intro + one or two cards layout
- lack visual hierarchy after the first section
- do not have enough structured content blocks
- do not yet resemble the richer reference screenshots

## Refactor Goals

Refactor the remaining pages so they:
- feel visually consistent with the updated homepage
- are much closer to the richer reference screenshots
- preserve the current HTML/CSS/JS-only stack
- keep the current backend/API contract intact
- stay within the SRS scope

## SRS / Scope Guardrails

Keep these constraints:
- no authentication flow
- single-user demonstration mode
- dashboard must remain driven by workout history
- progress must remain driven by workout history and derived metrics
- workout page must remain tied to recommendation logic / workout logging
- settings must not imply unsupported real account management
- map must remain a static interactive map, not real-time tracking

## Implementation Guidance

### Shared Style Direction

Reuse the current homepage direction:
- green, white, and blue palette
- soft gradients and glows
- rounded large cards
- stronger typographic hierarchy
- consistent header/footer shell
- visually distinct sections with breathing room

### Dashboard

Refactor `frontend/dashboard.html` to include:
- a stronger hero/intro area
- top stat cards
- better recent workouts presentation
- a secondary panel for weekly summary or quick insights

Do not:
- invent new backend data fields
- remove existing IDs used by `dashboard.js`

### Workout

Refactor `frontend/workout.html` so it feels more like a recommendation/configuration screen:
- left-side configuration or grouped controls
- right-side output/preview panel
- more intentional card sections
- stronger CTA button treatment

Do not:
- break `workout-form`
- remove `workout-type`, `duration`, or `notes` without replacing them carefully

### Progress

Refactor `frontend/progress.html` to include:
- stat cards at the top
- workout breakdown section
- improved chart/history container styling
- stronger page-level hierarchy

Do not:
- invent unsupported backend endpoints
- pretend chart data exists if it does not

### Settings

Refactor `frontend/settings.html` to include:
- backend-safe card/section
- UI-only planned fields card/section
- labels/badges making that distinction obvious
- more complete profile-style layout

Do not:
- imply authentication or persistent account support beyond the project scope

### Map

Refactor `frontend/map.html` to include:
- larger map presentation area
- side panel for selected zone details or instructions
- building hours or usage tips section
- map legend or labels

Do not:
- imply real-time location tracking

## Claude Prompt

```txt
Refactor the remaining static pages of my SweatLogic project so they visually match the richer UI reference more closely while staying in plain HTML, CSS, and JavaScript only.

Important constraints:
- Do not use React, Next.js, TypeScript, JSX, component libraries, or build tooling.
- Keep the final implementation compatible with a simple static frontend.
- Reuse the existing shared visual direction already established on the homepage: green/white/blue palette, rounded cards, soft gradients, clean shadows, stronger typography, and a consistent header/footer shell.
- Preserve existing JS hooks and IDs where possible because the pages already have working logic.

Pages to refactor:
- frontend/dashboard.html
- frontend/workout.html
- frontend/progress.html
- frontend/settings.html
- frontend/map.html

Files already in use:
- frontend/css/styles.css
- frontend/js/dashboard.js
- frontend/js/workout.js
- frontend/js/progress.js
- frontend/js/settings.js

Refactor goals by page:

Dashboard:
- Add a stronger intro section
- Add top stat cards
- Improve recent workouts layout
- Add clearer hierarchy and spacing
- Keep it driven by workout history and existing data

Workout:
- Make it feel like a recommendation/configuration page
- Use grouped sections or a two-column layout
- Separate setup controls from output/preview
- Keep current workout logging/recommendation flow compatible with existing logic

Progress:
- Add stat cards across the top
- Add workout breakdown and better chart/history structure
- Make the page feel data-rich and more complete
- Keep it grounded in workout history and derived metrics

Settings:
- Separate backend-safe fields from UI-only planned fields
- Add labels or badges like “UI Only”
- Make it feel like a real profile/preferences page
- Do not imply real authentication or full account management

Map:
- Create a split layout with map area and side info panel
- Add labeled zones, legend, and supporting detail cards
- Keep the map static and informative, not real-time

SRS guardrails:
- no authentication flow
- single-user demonstration scope
- dashboard and progress must stay tied to workout history
- workout page must stay tied to recommendation/workout logic
- map must remain a static interactive map
- settings must remain honest about current backend support

Design direction from screenshots:
- the target look is richer and more structured than the current plain pages
- dashboard should feel like a modern summary screen
- workout should feel like a two-column planner/recommendation interface
- progress should feel like a true analytics/history page
- settings should feel like a structured profile form
- map should feel like an interactive facility guide with side details

Please output refactored HTML and CSS changes that fit directly into this project’s plain static frontend.
```

## Shorter Version

```txt
Refactor my remaining static SweatLogic pages (dashboard, workout, progress, settings, map) to match a richer modern green/white/blue UI style while staying plain HTML/CSS/JavaScript only. Reuse the homepage visual direction, preserve existing JS hooks/IDs, keep the backend contracts unchanged, and stay within SRS scope: no auth, single-user demo, workout/progress driven by workout history, settings honest about backend-safe vs UI-only fields, and map kept static and informational.
```

## Notes

- If you want literal screenshots embedded in markdown, save those images to disk and add them to the repo, then they can be linked here directly.
- For now, this document captures the screenshots as structured visual requirements and a Claude-ready prompt.
