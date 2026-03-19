# v0 Revision Priorities And Prompt

Use this document for the next Vercel/v0 iteration.

## Priority Order

These changes should be addressed in this order.

### 1. Fix Branding Fidelity

Highest priority because the generated UI is currently missing the most visible brand requirements.

Must fix:
- keep the existing SweatLogic logo visible and recognizable
- do not replace, redesign, or omit the logo
- use a clear green, white, and blue palette
- stop using generic/default-looking styling

Why first:
- if the branding is wrong, the whole UI will feel off even if the layout is good
- this is the easiest problem for v0 to correct cleanly before implementation

### 2. Improve Visual Quality And “Cool Factor”

Must fix:
- add intentional visual effects, not basic placeholder styling
- use layered backgrounds, gradients, shapes, or texture
- add meaningful motion and reveal behavior
- make the landing page and dashboard feel polished and memorable

Why second:
- this is the main quality gap in the current export
- easier to refine before wiring data and implementation details

### 3. Correct Data Contract Drift

Must fix:
- align all UI fields to `docs/ui-data-contracts.md`
- remove or isolate unsupported backend fields
- stop mixing recommendation data and workout history data
- ensure enums and field names match the backend contracts exactly

Known drift to correct:
- `Exercise.category` should not treat `endurance` as a backend-safe exercise category
- profile fields beyond `id`, `username`, and `unit` must be clearly marked UI-only
- `Workout` and `WorkoutPlan` must remain separate types

Why third:
- contract drift creates integration pain later
- better to fix the design/data model now before implementation begins

### 4. Tighten Screen Flow To Match Requirements

Must fix:
- landing/start page should guide users clearly
- dashboard should feel driven by workout history
- workout page should feel driven by recommendation output
- settings should not imply full auth or unsupported persistent profile behavior

Why fourth:
- once branding and contracts are corrected, flow refinement becomes easier

### 5. Implementation Readiness

Must fix:
- keep the UI export organized and implementation-ready
- avoid overcomplicated widgets that do not help the core product
- keep components reusable and page structure clear

Why fifth:
- this is important, but it should happen after the branding and data shape are correct

## v0 Revision Prompt

Paste this into Vercel/v0 for the next revision.

```txt
Revise the existing SweatLogic UI. The current version is too generic, does not consistently show the existing logo, does not follow the required green/white/blue brand palette strongly enough, and needs better alignment to our real data contracts.

Primary goals for this revision:
1. Keep the existing SweatLogic logo visible and unchanged. Do not redesign, replace, reinterpret, or omit the logo.
2. Use a clear brand palette centered on green, white, and blue.
3. Make the UI feel more polished, distinctive, and modern instead of basic. Add intentional visual effects, stronger composition, and tasteful motion.
4. Correct all data-contract drift so the UI remains easy to integrate with the existing backend.

Branding requirements:
- Preserve the current SweatLogic logo exactly as an existing brand asset.
- Logo must be visibly present in the header and/or hero area.
- Primary color family: green.
- Secondary color family: blue.
- Base surfaces/backgrounds: white and light neutrals.
- Avoid purple-heavy, generic SaaS styling.
- Avoid replacing the logo with abstract icons or placeholder marks.

Visual direction:
- design for UNT students
- energetic, athletic, clean, and modern
- make the landing page and dashboard feel premium and engaging
- use layered backgrounds, subtle gradients, geometric shapes, soft glow, or pattern accents
- use a few meaningful animations or transitions, not noisy motion everywhere
- avoid a flat, basic, default component-library look

Required screens:
- landing/start page
- dashboard
- workout recommendation page
- progress page
- map page
- settings/profile page

Navigation:
- Home
- Dashboard
- Workout
- Progress
- Map
- Settings

Data contract corrections:
- do not rename fields
- do not invent auth or multi-user account flows
- use ISO date strings
- keep these exact enums:
  - bodyPart: chest, back, legs, arms, core
  - goal: strength, cardio, endurance
  - level: beginner, intermediate, advanced
  - unit: imperial, metric
  - workout.type: running, cycling, weights, other

Canonical backend-safe entities:

User:
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial"
}

Workout:
{
  "id": 12,
  "type": "weights",
  "duration": 40,
  "notes": "Shoulders and core",
  "date": "2026-02-27T15:26:30.087"
}

Exercise:
{
  "id": 1,
  "name": "Bench Press",
  "bodyPart": "chest",
  "category": "strength",
  "sets": 3,
  "reps": "8-12",
  "instructions": "Lower the bar to chest level and press upward with control."
}

WorkoutPlan:
{
  "bodyPart": "chest",
  "goal": "strength",
  "level": "intermediate",
  "exercises": [
    {
      "id": 1,
      "name": "Bench Press",
      "bodyPart": "chest",
      "category": "strength",
      "sets": 3,
      "reps": "8-12",
      "instructions": "Lower the bar to chest level and press upward with control."
    }
  ]
}

Important data drift corrections:
- Do not treat Exercise.category as if it includes endurance by default. Exercise.category should stay display-oriented and backend-aligned, with values like strength, cardio, or flexibility where appropriate.
- Endurance belongs to workout goal selection, not as a required exercise category type.
- Do not merge Workout and WorkoutPlan into one model.
- Do not imply that all profile fields are backend-supported.
- Only these profile fields are backend-safe today: username, unit.
- If you include heightCm, weightKg, age, gender, goal, or experienceLevel, clearly label them as planned/additional or UI-only fields.

Screen behavior guidance:
- Landing page should feel like a strong branded entry point and still provide quick access to key features.
- Dashboard should look dynamic and polished, but should conceptually be driven by workout history and derived metrics.
- Workout page should clearly reflect recommendation-driven data based on bodyPart, goal, and level.
- Progress page should feel data-rich without inventing unsupported backend endpoints.
- Map page should remain a static interactive map concept, not real-time tracking.
- Settings page should not imply login or full account management.

Do not:
- redesign the logo
- hide the logo
- use a generic default palette
- invent authentication flows
- invent unsupported backend fields without labeling them UI-only
- rename bodyPart, goal, level, unit, duration, notes, or date
- change reps into a number
- collapse Workout and WorkoutPlan into one object

Output preference:
- implementation-ready UI
- reusable components
- clear visual hierarchy
- stronger personality than the current version
- maintainable structure suitable for later integration into a real frontend
```

## Short Correction Prompt

Use this if you want a shorter follow-up prompt instead of the full one.

```txt
Revise the existing SweatLogic UI to preserve the current logo exactly, make the logo clearly visible, switch the visual identity to a strong green/white/blue palette, and make the design more polished and memorable instead of basic. Add tasteful motion, layered backgrounds, and stronger visual hierarchy. Also correct all data drift: keep exact field names and enums, do not merge Workout and WorkoutPlan, do not treat Exercise.category as endurance-based, and keep extra profile fields clearly marked as UI-only since the backend only supports username and unit right now.
```
