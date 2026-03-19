# Project Completion Checklist

This document summarizes what is still incomplete in SweatLogic compared to the intended project end state.

## Target End State

- Backend: Java + Spring Boot
- Frontend: plain HTML/CSS/JavaScript
- Database: SQLite
- Access model: single-user demo, no authentication
- Core deliverables:
  - landing page with quick access
  - dashboard with recent activity, streaks, and today's recommendation
  - workout recommendation view with exercise details
  - progress/history view with metrics and calendar or list history
  - static interactive UNT rec center map
  - settings/profile page

## What Is Already In Place

- Backend APIs exist for:
  - workouts
  - exercises
  - users
  - workout recommendations
- Plain frontend visual redesign is partially complete:
  - landing page is close to target
  - dashboard, workout, progress, settings, and map have improved layouts
- Workout logging works with the backend
- Backend recommendation logic exists, but the plain frontend is not fully wired to it yet

## What Still Needs To Be Completed

### 1. Workout Recommendation Flow

Status: not complete

Still needed:
- add body-part selection UI on the plain frontend
- add goal selection UI using valid enums
- add experience-level selection UI using valid enums
- call the backend recommendation endpoint
- render returned exercises in the page
- show exercise details:
  - name
  - sets
  - reps
  - instructions
- support workout customization in the UI:
  - add/remove exercises
- allow the generated workout to be marked complete

Why it matters:
- this is one of the main required project features
- backend logic already exists, so this is mostly frontend wiring and interaction work

## 2. Dashboard Completion

Status: partially complete

Still needed:
- show today's recommended workout if one has been generated
- calculate and display current streak
- optionally show longest streak if you want stronger progress visibility
- make quick actions and summary cards reflect real app state consistently

Why it matters:
- the current dashboard looks much better, but it still does not fully meet the SRS dashboard expectations

## 3. Progress Page Completion

Status: partially complete

Still needed:
- implement actual chart rendering or replace chart canvases with a simpler real data view
- add workout history calendar or clearer list-based history view
- calculate current streak
- calculate longest streak
- show user-defined fitness goals alongside progress stats
- ensure all progress metrics come from real logged workouts

Why it matters:
- this page is one of the largest remaining feature gaps
- it currently has good structure but not full depth

## 4. Settings / Profile Completion

Status: partially complete

Still needed:
- decide final scope for profile data
- if following the broader SRS profile model, add support for:
  - age
  - height
  - weight
  - gender
  - fitness goals
- decide whether those fields should be:
  - backend-supported
  - session-only demo fields
- remove or clearly finalize any "planned" placeholder fields before submission

Why it matters:
- right now only username and unit are actually active
- the page is honest, but not at the fuller end-state described in the requirements

## 5. Rec Center Map Completion

Status: not complete

Still needed:
- replace placeholder map content with a real static floor plan or designed map image
- label key equipment zones
- support static interaction:
  - click
  - hover
  - tooltip/info card
- keep it informational only, not real-time

Why it matters:
- the current page shell is good, but the actual map feature is still missing

## 6. Data / Logic Alignment

Status: partially complete

Still needed:
- make sure the plain frontend uses the existing backend contracts consistently
- avoid placeholder data where real API data should be shown
- align settings/profile behavior with the final decision on scope
- verify enum values stay consistent between frontend and backend

Why it matters:
- this reduces integration bugs and keeps the project aligned with the actual implementation

## 7. Final Repo Cleanup Before Merge

Status: not complete

Still needed:
- decide what should go to `main`
- keep only final production app files on the final merge branch
- likely exclude from final `main`:
  - `frontend-next/`
  - prototype-only docs
  - temporary planning docs not needed for delivery
- clean generated artifacts and build output from version control

Why it matters:
- `main` should reflect the actual final application, not prototype experiments

## Recommended Order To Finish

1. Complete workout recommendation flow in the plain frontend
2. Finish dashboard metrics and recommendation summary
3. Finish progress metrics, streaks, and history/calendar
4. Complete the static interactive map
5. Finalize settings/profile scope
6. Do repo cleanup for final merge

## Minimum Viable Finish

If time gets tight, the minimum high-value path is:

1. Wire workout recommendations into `frontend/workout.html`
2. Add streak calculation for dashboard and progress
3. Add a real workout history list or calendar
4. Replace the placeholder map with a real static labeled map
5. Keep settings simple but clearly finalized

## Final Readiness Check

Before merging to `main`, confirm:

- frontend is still plain HTML/CSS/JS
- backend compiles and runs
- workout logging works
- recommendation flow works
- progress page shows real data
- map is no longer placeholder content
- settings page matches the final agreed scope
- branch no longer contains prototype-only files meant to stay out of final delivery
