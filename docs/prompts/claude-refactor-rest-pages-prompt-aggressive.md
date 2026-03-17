# Claude Refactor Prompt For Remaining Pages (Aggressive Visual Pass)

Use this version if you want Claude to push the remaining static pages much closer to the richer `localhost:3000` UI direction while still respecting the current stack and SRS limits.

## Purpose

The homepage already looks close enough to the intended direction.

The remaining pages still feel too plain compared to the richer reference. This prompt asks Claude to make them feel much more complete, structured, and premium without switching away from plain HTML/CSS/JS.

## Non-Negotiable Constraints

- Stay in plain HTML, CSS, and JavaScript only.
- Do not use React, Next.js, TypeScript, JSX, Tailwind, or component libraries.
- Do not break existing JS hooks and IDs unless absolutely necessary.
- Keep backend contracts unchanged.
- Keep the app within SRS scope.

## Pages To Refactor

- `frontend/dashboard.html`
- `frontend/workout.html`
- `frontend/progress.html`
- `frontend/settings.html`
- `frontend/map.html`

## Existing Files In Play

- `frontend/css/styles.css`
- `frontend/js/dashboard.js`
- `frontend/js/workout.js`
- `frontend/js/progress.js`
- `frontend/js/settings.js`

## Design Goal

The goal is not a tiny polish pass.

The goal is to make the remaining pages feel:
- intentional
- visually rich
- clearly structured
- much closer to the modern `localhost:3000` references
- consistent with the already-improved homepage

These pages should stop feeling like placeholders and start feeling like real product screens.

## Aggressive Visual Direction

Push harder on:
- larger and more confident section layouts
- stronger typography hierarchy
- clearer top-of-page summaries
- richer cards with better spacing and grouping
- more obvious visual distinction between primary and secondary content
- better content density
- more polished control states
- more “product UI” feel and less “basic page with a form”

Use:
- a crisp green/white/blue palette
- large rounded cards
- soft glow and gradient accents
- subtle depth and layering
- more refined stat blocks
- stronger button treatment
- more structured sections

Avoid:
- generic bare white boxes with minimal hierarchy
- thin content areas with large empty space
- tiny single-column layouts when a split or dashboard layout would work better
- plain ungrouped forms when sectioned cards would read better

## What Each Page Should Feel Like

### Dashboard

Should feel like:
- a real command center
- a quick-read activity and insights page
- a page with summary cards, recent activity, and secondary insight blocks

Should include:
- strong top summary area
- multiple stat cards
- recent workout list with clearer presentation
- one or two additional panels such as weekly summary, quick actions, or distribution/insight placeholders that still stay grounded in real data

### Workout

Should feel like:
- a workout planner / recommendation screen
- a split workspace
- controls on one side, outcome on the other

Should include:
- grouped workout setup controls
- body-part / goal / level UI if possible within current constraints
- stronger action area
- output/preview card or recommendation placeholder space

### Progress

Should feel like:
- a performance tracking dashboard
- a data-rich page, not a stub

Should include:
- top summary cards
- workout breakdown section
- chart/history/calendar framing
- richer sections that imply useful analysis without inventing unsupported backend capabilities

### Settings

Should feel like:
- a real profile/preferences screen
- clearly sectioned
- honest about backend-safe vs UI-only fields

Should include:
- backend-safe section
- UI-only/planned section
- labels, badges, and helper text
- much better visual grouping and spacing

### Map

Should feel like:
- a facility navigation interface
- a guided static map experience

Should include:
- structured map layout
- map area + detail panel
- legend
- side information cards
- building hours / guidance / tips

## SRS Guardrails

Do not violate these:
- no authentication flow
- no persistent multi-user account behavior
- single-user demonstration mode
- dashboard and progress should still be based on workout history
- workout should stay tied to current workout/recommendation logic
- settings must not imply full account management beyond current scope
- map must remain static and informational, not live tracking

## Claude Prompt

```txt
Refactor the remaining static pages of my SweatLogic project so they feel much closer to a rich modern product UI while staying in plain HTML, CSS, and JavaScript only.

Important:
- Do not use React, Next.js, TypeScript, JSX, Tailwind, or component libraries.
- Preserve existing JS hooks and IDs where possible.
- Keep backend contracts unchanged.
- Stay within SRS scope.

The homepage is already visually close enough. The remaining pages still feel too plain and need a much stronger refactor:
- frontend/dashboard.html
- frontend/workout.html
- frontend/progress.html
- frontend/settings.html
- frontend/map.html

Reuse and extend the shared styling in:
- frontend/css/styles.css

Current supporting JS files:
- frontend/js/dashboard.js
- frontend/js/workout.js
- frontend/js/progress.js
- frontend/js/settings.js

Visual direction:
- green, white, and blue palette
- large rounded cards
- stronger typography hierarchy
- cleaner spacing
- more structured dashboard-style layouts
- richer section design
- subtle glow/gradient depth
- more polished controls and panels

This should be an aggressive visual pass, not just a minor cleanup. The pages should stop feeling like simple placeholders and instead feel like a cohesive modern application.

Page-specific goals:

Dashboard:
- make it feel like a true summary/insights screen
- add multiple stat cards
- improve recent activity layout
- add additional useful panels that stay grounded in current data

Workout:
- make it feel like a planner/recommendation workspace
- create stronger grouped setup controls
- use a split layout if possible
- emphasize the primary action and output area

Progress:
- make it feel like an analytics/history page
- add stat cards
- improve workout breakdown
- improve history/calendar/chart framing

Settings:
- make it feel like a structured profile/preferences page
- clearly separate backend-safe fields from UI-only/planned fields
- use badges/helper text/section cards

Map:
- make it feel like a static facility guide
- use a split layout with map panel and details
- add legend, hours, tips, and selected-zone support blocks

SRS constraints:
- no auth
- single-user demo scope
- dashboard/progress tied to workout history
- workout tied to recommendation/workout logic
- settings honest about backend support
- map static and informational only

Output refactored HTML and CSS changes that fit directly into this static frontend project.
```

## When To Use This Version

Use this aggressive prompt if:
- the first Claude pass feels too conservative
- the pages still look too much like simple forms/cards
- you want Claude to push layout, hierarchy, and screen richness harder

Use the non-aggressive version if:
- you want tighter control
- you want smaller iterations
- you want lower risk of overdesign
