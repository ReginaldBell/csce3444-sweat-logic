# Vercel / v0 UI Prompt Spec

Use this prompt to generate SweatLogic UI screens without drifting from the current project data contracts.

## Prompt

Build a multi-page fitness tracker UI called "SweatLogic" for UNT students.

Design goals:
- clean, modern student-friendly UI
- web app with these screens: landing/start page, dashboard, workout recommendation page, progress page, map page, settings/profile page
- desktop-first but responsive on laptop
- navigation should include Home, Dashboard, Workout, Progress, Map, Settings
- use realistic demo data
- keep the design implementation-ready for plain HTML/CSS/JS or simple component export

Data contract rules:
- do not rename fields
- do not invent new backend fields unless clearly marked UI-only
- use ISO date strings
- use these exact enum values:
  - bodyPart: chest, back, legs, arms, core
  - goal: strength, cardio, endurance
  - level: beginner, intermediate, advanced
  - unit: imperial, metric
  - workout.type: running, cycling, weights, other

Current backend-supported entities:

User:
```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial"
}
```

Workout:
```json
{
  "id": 12,
  "type": "weights",
  "duration": 40,
  "notes": "Shoulders and core",
  "date": "2026-02-27T15:26:30.087"
}
```

Exercise:
```json
{
  "id": 1,
  "name": "Bench Press",
  "bodyPart": "chest",
  "category": "strength",
  "sets": 3,
  "reps": "8-12",
  "instructions": "Lower the bar to chest level and press upward with control."
}
```

WorkoutPlan:
```json
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
```

Backend-safe profile fields today:
- username
- unit

Allowed UI-only planned profile fields:
- heightCm
- weightKg
- age
- gender
- goal
- experienceLevel

Important constraint:
- keep UI-only profile fields visually separate from backend-safe fields so integration is easy later

Screen requirements:

1. Landing / Start Page
- hero section introducing SweatLogic
- a "Get Started" flow or profile setup card
- can include height/weight onboarding UI
- should provide quick access to core features
- should not require authentication

2. Dashboard
- show recent workouts
- show total workouts this week
- show total workout duration this week
- may include a placeholder card for today's recommendation
- use Workout data only unless explicitly labeled derived/mock

3. Workout Recommendation Page
- body-part selector using: chest, back, legs, arms, core
- optional goal selector: strength, cardio, endurance
- optional level selector: beginner, intermediate, advanced
- display a generated WorkoutPlan
- each exercise card must show: name, category, sets, reps, instructions
- allow UI affordances for add/remove/customize, but make it clear customization is UI state unless saved later

4. Progress Page
- show workout history list or calendar-like layout
- show total workouts
- show total duration
- can show streak cards as derived/demo metrics

5. Map Page
- static recreation center map UI
- labeled equipment zones
- hover/click detail cards allowed
- no real-time tracking

6. Settings / Profile Page
- editable username
- editable unit
- optional profile setup fields clearly marked as planned/additional

Interaction rules:
- recommendation page should feel driven by the WorkoutPlan contract
- dashboard and progress should feel driven by Workout history
- settings should not assume the backend already supports every profile field
- error states should be designed for failed API calls or empty data

Do not:
- invent login/auth flows
- invent persistent multi-user features
- rename `bodyPart`, `goal`, `level`, `unit`, `duration`, `notes`, or `date`
- change `reps` into a numeric field
- merge Workout and WorkoutPlan into one object

Output preference:
- generate implementation-ready UI with reusable sections/components
- keep pages aligned with a simple frontend stack
- use realistic sample JSON matching the contracts above

## Short Version

If you want an even shorter prompt, use this:

```txt
Create a modern multi-page UI for a student fitness app called SweatLogic with pages for Home, Dashboard, Workout, Progress, Map, and Settings. Keep the UI aligned to these exact backend contracts: User {id, username, unit}, Workout {id, type, duration, notes, date}, Exercise {id, name, bodyPart, category, sets, reps, instructions}, WorkoutPlan {bodyPart, goal, level, exercises[]}. Use exact enum values: bodyPart = chest/back/legs/arms/core, goal = strength/cardio/endurance, level = beginner/intermediate/advanced, unit = imperial/metric. Do not invent auth, do not rename fields, do not merge Workout and WorkoutPlan, and treat extra profile fields like height/weight/age/gender as UI-only planned fields. Make the dashboard driven by workout history, the workout page driven by workout recommendations, and the map page a static interactive UNT rec center map.
```
