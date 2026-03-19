# Plain Frontend Migration Plan

This plan ports the approved UI direction into the existing plain `frontend/` app while keeping the current backend logic and staying within an HTML/CSS/JavaScript stack.

## Goal

Rebuild the visual layer of the current static frontend so it:
- matches the approved style direction
- stays aligned with the SRS
- reuses the existing backend APIs
- avoids introducing Next.js, React, or TypeScript into the final submission frontend

## Guiding Rules

- Keep the backend contracts as the source of truth.
- Treat `frontend-next/` as a visual reference, not the final framework.
- Keep `main` focused on production application files only.
- Do not rename backend fields just to match UI wording.
- Keep unsupported profile fields clearly separated from backend-safe fields.

## Phase 1: Shared Shell

Objective: Create one consistent visual system across all static pages.

Tasks:
- Refactor [styles.css](C:/Users/User/csce3444-sweat-logic/frontend/css/styles.css) into a shared design system.
- Define shared colors, spacing, card styles, button styles, and typography rules.
- Standardize the header/nav layout across all static pages.
- Standardize the footer across all static pages.
- Fix logo behavior so it is a controlled brand element, not a page-breaking graphic.

Definition of done:
- all pages share the same header/footer shell
- logo is stable and properly sized
- buttons/cards/spacing look consistent

## Phase 2: Landing Page

Objective: Make the homepage match the style direction and SRS entry-point requirements.

Target file:
- [index.html](C:/Users/User/csce3444-sweat-logic/frontend/index.html)

Tasks:
- add polished hero styling using plain HTML/CSS
- preserve quick access to Dashboard, Workout, Progress, and Map
- keep a clear `Get Started` path
- keep the page open without authentication
- keep onboarding/profile prompts lightweight and SRS-safe

Definition of done:
- landing page looks polished
- quick access is obvious
- no auth wall exists

## Phase 3: Dashboard

Objective: Upgrade the dashboard UI without changing the data model.

Target file:
- [dashboard.html](C:/Users/User/csce3444-sweat-logic/frontend/dashboard.html)

Tasks:
- redesign summary cards and recent activity section
- keep dashboard driven by `/api/workouts`
- show recent workouts, this-week totals, and streak/summary metrics
- add stronger visual hierarchy and card styling

Definition of done:
- dashboard looks modern
- data still comes from existing workout logic
- no contract drift is introduced

## Phase 4: Progress

Objective: Bring the progress page up to the same quality level as dashboard.

Target file:
- [progress.html](C:/Users/User/csce3444-sweat-logic/frontend/progress.html)

Tasks:
- redesign workout history layout
- present total workouts, total duration, and streak metrics clearly
- improve chart/calendar/history styling if used
- keep progress driven by workout history, not fake new endpoints

Definition of done:
- progress page is visually aligned with dashboard
- metrics remain grounded in real workout data

## Phase 5: Workout Recommendation

Objective: Modernize the workout page while preserving rule-based recommendation logic.

Target file:
- [workout.html](C:/Users/User/csce3444-sweat-logic/frontend/workout.html)

Tasks:
- improve body-part, goal, and level selection UI
- preserve the recommendation flow and backend contract
- display exercise details clearly: name, category, sets, reps, instructions
- keep customization affordances lightweight unless already supported

Definition of done:
- recommendation flow looks polished
- recommendation output still matches `WorkoutPlan`

## Phase 6: Settings / Profile

Objective: Improve profile UX without overstating backend support.

Target file:
- [settings.html](C:/Users/User/csce3444-sweat-logic/frontend/settings.html)

Tasks:
- visually separate backend-safe fields from UI-only planned fields
- keep `username` and `unit` as the backend-safe profile contract
- if height, weight, age, gender, goal, or level are shown, label them as local/demo/planned
- keep the page aligned with single-user demo scope

Definition of done:
- profile page is clearer and more honest
- no fake account/auth behavior is implied

## Phase 7: Map

Objective: Make the map page visually stronger while staying inside SRS scope.

Target file:
- [map.html](C:/Users/User/csce3444-sweat-logic/frontend/map.html)

Tasks:
- improve the map page layout and styling
- keep map behavior static and interactive only through labels/tooltips/click targets
- clearly label equipment zones and functional areas
- avoid implying real-time navigation or tracking

Definition of done:
- map page feels integrated with the rest of the app
- it remains a static interactive map, not a live tracking tool

## Phase 8: Final Cleanup

Objective: Prepare for merge into `main`.

Tasks:
- remove temporary assets and experimental leftovers
- keep only the final chosen frontend path for merge
- verify app pages still work with the backend
- verify no framework-only prototype files are being merged unintentionally
- decide which docs are branch-only versus merge-worthy

Definition of done:
- branch contains only files needed for the actual application and any truly necessary docs
- frontend is consistent and functional

## Recommended Work Order

1. Shared shell and CSS system
2. Landing page
3. Dashboard
4. Progress
5. Workout
6. Settings
7. Map
8. Final cleanup

## SRS Watchlist

As work proceeds, keep checking these constraints:
- no authentication requirement
- single-user demonstration scope
- quick access from the landing page
- dashboard shows workout-driven summaries
- progress remains based on workout history
- map remains static interactive, not real-time
- profile fields beyond backend support are clearly marked

## Practical Notes

- Reuse the visual ideas from `frontend-next/`, but translate them into simple HTML/CSS/JS patterns.
- Prefer enhancing existing pages over rebuilding everything from scratch.
- Finish shared layout and CSS first so page migration becomes much faster.
