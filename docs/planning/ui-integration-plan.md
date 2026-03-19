# UI Integration Plan

This plan describes the best way to integrate the generated UI from:

`C:\Users\User\Downloads\ui design csce`

into this repository.

## Recommendation

Do **not** try to manually convert the generated Next.js UI into the current plain `frontend/*.html` pages.

Best path:
- adopt the generated UI as a new frontend app
- keep the Spring Boot backend as-is
- replace demo/mock data in the generated UI with real API calls in phases

Why this is the best path:
- the generated UI is already structured as a full Next.js App Router project
- it uses React, TypeScript, shared components, and a design system
- forcing it back into static HTML/JS would be slow, brittle, and would lose much of the generated structure
- the current backend already exposes REST APIs that can support the new UI

## Current Stack Mismatch

Current repo frontend:
- static HTML files in `frontend/`
- plain CSS
- plain JavaScript

Generated UI:
- Next.js 16
- React 19
- TypeScript
- App Router structure under `app/`
- shared components under `components/`
- mock data in `lib/data.ts`

Because of this mismatch, there are two options:

### Option A: Recommended

Create a new app-based frontend in the repo and migrate to it.

Suggested folder:
- `frontend-next/`

### Option B: Not Recommended

Translate each generated React page back into static HTML/CSS/JS.

Why not:
- high manual effort
- easy to break layout and interactions
- duplicates work
- harder to maintain long-term

## Integration Architecture

Target architecture:

- `backend/` stays the Spring Boot API
- `frontend-next/` becomes the main UI
- existing `frontend/` can be kept temporarily as legacy/demo until replacement is complete

Data flow:

- Next.js frontend fetches from `http://localhost:8080/api`
- backend remains source of truth for:
  - users
  - workouts
  - exercises
  - recommendations

UI-only data remains temporary only until matching backend contracts exist.

## Phase Plan

### Phase 1: Import UI Project

Goal:
- bring generated UI into the repo intact

Steps:
- copy exported UI into a new repo folder such as `frontend-next/`
- keep its `app/`, `components/`, `lib/`, `public/`, `styles/`, and config files together
- do not mix it into `frontend/`

Expected result:
- generated UI can run independently inside this repo

### Phase 2: Normalize Branding And Contracts

Goal:
- align generated UI with project requirements before wiring data

Steps:
- keep the existing logo component and asset behavior consistent
- lock color palette to green, white, and blue
- compare generated UI labels and fields against:
  - `docs/ui-data-contracts.md`
  - `docs/vercel-ui-prompt-spec.md`
- rename any drifted UI-only fields before integration work begins

Expected result:
- screen structure matches project language and data contracts

### Phase 3: Replace Demo Data Layer

Goal:
- stop using `lib/data.ts` as the runtime source

Steps:
- keep the TypeScript interfaces from `lib/data.ts`, but align them to backend truth
- create a dedicated API layer, for example:
  - `lib/api.ts`
  - `lib/contracts.ts`
- move mock/demo fixtures into a separate file for fallback only

Priority replacements:
1. dashboard workouts
2. workout recommendations
3. settings user profile
4. progress history

Expected result:
- UI renders real data from backend endpoints instead of local arrays

### Phase 4: Page-By-Page Wiring

Goal:
- integrate each page with real contracts in dependency order

Recommended order:

1. Settings/Profile
- easiest starting point
- maps to `/api/users`
- establish user/profile loading and save flow

2. Dashboard
- replace `demoWorkouts` with `GET /api/workouts`
- compute totals client-side for now

3. Workout Page
- replace generated plan logic with `GET /api/recommendations/generate/{bodyPart}`
- use real enum values and backend response shape

4. Progress Page
- reuse workouts API
- compute display metrics client-side

5. Map Page
- mostly static, low integration risk

6. Landing Page
- connect CTA flow to real routes after other pages are stable

### Phase 5: Retire Legacy Frontend

Goal:
- move from old static frontend to the new UI

Steps:
- once core pages are working in `frontend-next/`, stop updating `frontend/`
- optionally archive or remove static pages after the team agrees

## Contract Mapping

The generated UI already has useful model shapes in:
- `C:\Users\User\Downloads\ui design csce\lib\data.ts`

But these need adjustments:

### Safe To Keep

- `User`
- `Workout`
- `WorkoutPlan`
- most field names

### Needs Adjustment

- generated `Exercise.category` includes `"endurance"` in the TypeScript union
- backend currently treats exercise category as strings such as:
  - `strength`
  - `cardio`
  - `flexibility`

Action:
- do not hard-code `Exercise.category` to a narrow frontend-only union unless it matches backend

### Keep UI-Only Fields Separate

Generated UI includes planned profile fields:
- `heightCm`
- `weightKg`
- `age`
- `gender`
- `goal`
- `experienceLevel`

Backend currently supports only:
- `id`
- `username`
- `unit`

Action:
- keep a split between backend-safe user data and UI-only planned profile fields

## API Mapping

Generated UI should be rewired to these real endpoints:

### Dashboard / Progress

- `GET /api/workouts`

### Workout Recommendation

- `GET /api/recommendations/generate/{bodyPart}?goal={goal}&level={level}`

### Settings

- `GET /api/users/{id}`
- `GET /api/users/by-username/{username}`
- `POST /api/users`
- `PUT /api/users/{id}`

### Exercise Drilldown

- `GET /api/exercises`
- `GET /api/exercises/{id}`
- `GET /api/exercises/by-body-part/{bodyPart}`

## Suggested Frontend Refactor Structure

Inside the new frontend app:

- `lib/contracts.ts`
  - canonical TypeScript types matching backend contracts

- `lib/api.ts`
  - fetch wrappers for backend endpoints

- `lib/mappers.ts`
  - optional transformations from raw API data to UI view models

- `lib/mock-data.ts`
  - demo-only fallback data

- `app/(app)/dashboard/page.tsx`
  - fetch workouts

- `app/(app)/workout/page.tsx`
  - fetch recommendations

- `app/(app)/progress/page.tsx`
  - fetch workouts and derive metrics

- `app/(app)/settings/page.tsx`
  - load/save user

## Integration Risks

### 1. Overwriting Current Work

Risk:
- replacing `frontend/` immediately could disrupt the team

Mitigation:
- keep generated UI in a separate folder first

### 2. Mock Data Drift

Risk:
- generated screens keep using `lib/data.ts` and stop reflecting backend reality

Mitigation:
- replace data source page-by-page
- keep types aligned with `docs/ui-data-contracts.md`

### 3. Contract Drift

Risk:
- Vercel-generated fields exceed current backend support

Mitigation:
- treat non-supported profile fields as UI-only until backend expands

### 4. Dependency Weight

Risk:
- the generated app brings in many UI dependencies

Mitigation:
- keep only the components actually used
- prune unused component files later

## Final Recommendation

Best integration strategy:

1. copy the generated UI into a new `frontend-next/` folder
2. run it as a separate Next.js frontend
3. replace `lib/data.ts` mock usage with real API calls
4. keep backend contracts authoritative
5. migrate page-by-page
6. retire the old static frontend only after the new app is stable

This gives you:
- fastest path to a polished UI
- lowest rework
- cleaner long-term architecture
- easiest path for your team to keep iterating
