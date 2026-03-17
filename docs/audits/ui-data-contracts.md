# SweatLogic UI Data Contracts

This document defines the data shapes and API contracts the UI should treat as canonical while iterating in Vercel/v0.

Goal:
- keep generated UI aligned with the current backend
- make frontend-to-backend integration predictable
- call out where the SRS is ahead of the current implementation

## Contract Rules

- Treat field names and enum values in this document as source of truth for UI work.
- Do not invent alternate names for the same concept. Example: use `bodyPart`, not `muscleGroup`.
- Keep date-time values as ISO 8601 strings.
- Assume the backend base URL is `http://localhost:8080/api` locally.
- Prefer nullable/optional display states in the UI instead of assuming data always exists.

## Current Backend Coverage

Implemented now:
- users
- workouts
- exercise catalog
- workout recommendations

Not fully implemented yet, even if mentioned in the SRS:
- full profile fields like age, height, weight, gender, fitness goals
- streak metrics in backend responses
- dedicated progress summary endpoint
- authenticated user/session model

## Canonical Enums

These values must be used exactly as written in UI state, query params, and mock data.

### `BodyPart`

```txt
chest
back
legs
arms
core
```

### `Goal`

```txt
strength
cardio
endurance
```

### `ExperienceLevel`

```txt
beginner
intermediate
advanced
```

### `Unit`

Current backend support:

```txt
imperial
metric
```

### `Workout.type`

Current seeded/backend examples:

```txt
running
cycling
weights
other
```

UI should avoid introducing more workout types unless the backend is updated too.

## Entity Contracts

### User

Current persisted backend shape:

```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial"
}
```

Field rules:
- `id`: number, server-generated
- `username`: string, required, unique
- `unit`: `"imperial"` or `"metric"`, required

UI notes:
- The SRS wants richer profile data, but the current backend only supports `username` and `unit`.
- If Vercel prototypes richer profile fields, mark them as planned UI-only fields until the backend contract is expanded.

Recommended UI-side extended profile model for prototypes:

```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial",
  "heightCm": null,
  "weightKg": null,
  "age": null,
  "gender": null,
  "goal": null,
  "experienceLevel": null
}
```

Only the first three fields are backend-safe today.

### Workout

Persisted backend shape:

```json
{
  "id": 12,
  "type": "weights",
  "duration": 40,
  "notes": "Shoulders and core",
  "date": "2026-02-27T15:26:30.087"
}
```

Field rules:
- `id`: number, server-generated
- `type`: string, required
- `duration`: number in minutes, required
- `notes`: string, optional
- `date`: ISO datetime string, required

UI constraints:
- `duration` should be positive
- `notes` may be empty
- if creating a workout from the UI, send `date` when known; the backend will default it to now if omitted

### Exercise

Read-only catalog shape:

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

Field rules:
- `id`: number
- `name`: string, unique
- `bodyPart`: one of `BodyPart`
- `category`: currently string values like `strength`, `cardio`, `flexibility`
- `sets`: number
- `reps`: string
- `instructions`: string

UI notes:
- `reps` is a string on purpose, so the UI must not assume it is numeric.
- `category` is not currently modeled as a backend enum, so treat it as display text.

### WorkoutPlan

Generated, not persisted:

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

Field rules:
- `bodyPart`: one of `BodyPart`
- `goal`: one of `Goal`
- `level`: one of `ExperienceLevel`
- `exercises`: ordered array of `Exercise`

UI notes:
- This object should drive the workout recommendation screen.
- If the user customizes the plan, keep that customization in UI state unless/until a save contract is added.

## API Contracts

Base URL:

```txt
http://localhost:8080/api
```

### Users API

#### `GET /users/{id}`

200:

```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial"
}
```

404:
- empty body

#### `GET /users/by-username/{username}`

200:

```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial"
}
```

404:
- empty body

#### `POST /users`

Request:

```json
{
  "username": "demo_user",
  "unit": "imperial"
}
```

Response 200:

```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "imperial"
}
```

#### `PUT /users/{id}`

Request:

```json
{
  "username": "demo_user",
  "unit": "metric"
}
```

Response 200:

```json
{
  "id": 1,
  "username": "demo_user",
  "unit": "metric"
}
```

404:
- empty body

### Workouts API

#### `GET /workouts`

Response 200:

```json
[
  {
    "id": 1,
    "type": "running",
    "duration": 30,
    "notes": "Morning jog around campus",
    "date": "2026-03-12T15:26:30.087"
  }
]
```

#### `GET /workouts/{id}`

Response 200:

```json
{
  "id": 1,
  "type": "running",
  "duration": 30,
  "notes": "Morning jog around campus",
  "date": "2026-03-12T15:26:30.087"
}
```

404:
- empty body

#### `POST /workouts`

Request:

```json
{
  "type": "weights",
  "duration": 45,
  "notes": "Chest and triceps day",
  "date": "2026-03-14T10:30:00"
}
```

Response 200:

```json
{
  "id": 13,
  "type": "weights",
  "duration": 45,
  "notes": "Chest and triceps day",
  "date": "2026-03-14T10:30:00"
}
```

#### `PUT /workouts/{id}`

Request:

```json
{
  "type": "weights",
  "duration": 50,
  "notes": "Updated notes",
  "date": "2026-03-14T10:30:00"
}
```

Response 200:

```json
{
  "id": 13,
  "type": "weights",
  "duration": 50,
  "notes": "Updated notes",
  "date": "2026-03-14T10:30:00"
}
```

404:
- empty body

#### `DELETE /workouts/{id}`

204:
- empty body

404:
- empty body

### Exercises API

#### `GET /exercises`

Response 200:
- array of `Exercise`

#### `GET /exercises/{id}`

Response 200:
- single `Exercise`

404:
- empty body

#### `GET /exercises/by-body-part/{bodyPart}`

Valid path values:
- `chest`
- `back`
- `legs`
- `arms`
- `core`

Response 200:
- array of `Exercise`

#### `GET /exercises/by-category/{category}`

Current seeded categories:
- `strength`
- `cardio`
- `flexibility`

Response 200:
- array of `Exercise`

### Recommendations API

#### `GET /recommendations/generate/{bodyPart}?goal={goal}&level={level}&seed={seed}`

Example:

```txt
/recommendations/generate/chest?goal=strength&level=intermediate
```

Defaults:
- `goal=strength`
- `level=intermediate`
- `seed` optional

Valid params:
- `bodyPart`: `chest | back | legs | arms | core`
- `goal`: `strength | cardio | endurance`
- `level`: `beginner | intermediate | advanced`
- `seed`: integer

Response 200:
- `WorkoutPlan`

Response 400:
- plain-text error string

Example 400 body:

```txt
Invalid goal: 'banana'. Must be one of: strength, cardio, endurance
```

UI notes:
- The UI must be prepared for non-JSON error responses from this endpoint.

## Frontend View Contracts

These are the minimum data dependencies each screen should assume.

### Landing / Start Page

Needs:
- local onboarding state
- optional UI-only profile draft

Should not require:
- workouts
- recommendations

### Dashboard

Needs:
- `GET /workouts`

Derived in UI:
- recent workouts list
- weekly total workouts
- weekly total duration

Not currently available from backend:
- current streak
- longest streak
- today's recommendation summary

### Workout Recommendation View

Needs:
- user-selected `bodyPart`
- optional `goal`
- optional `level`
- `GET /recommendations/generate/{bodyPart}`

Optional enrichment:
- `GET /exercises/{id}` if a dedicated drill-down panel is added

### Progress View

Needs:
- `GET /workouts`

Derived in UI:
- history list/calendar
- totals
- simple consistency metrics

### Settings / Profile View

Backend-safe fields:
- `username`
- `unit`

UI-only planned fields until backend expands:
- `heightCm`
- `weightKg`
- `age`
- `gender`
- `goal`
- `experienceLevel`

### Map View

Current contract:
- static frontend-only content
- no backend dependency

## Mock Data Guidance For Vercel

When mocking screens in Vercel/v0:
- use the exact field names in this document
- use valid enum strings only
- keep workouts and recommendations separate
- do not combine `Workout` and `WorkoutPlan` into one type

Recommended mock fixtures:
- one `User`
- 8 to 12 `Workout` items
- 10 to 15 `Exercise` items
- 2 to 3 `WorkoutPlan` responses for different body parts

## Integration Notes

- The current frontend already uses `http://localhost:8080/api`.
- CORS is enabled for `/api/**`.
- Recommendation errors can be plain text, so fetch handlers must not assume JSON on failure.
- The UI can safely compute many dashboard/progress metrics client-side from `/workouts`.

## Known Gaps Between SRS And Current Backend

The SRS asks for profile fields and metrics that do not yet exist in backend contracts. To avoid drift:

- prototype richer profile/setup UI if needed
- keep those extra fields in a clearly marked UI-only model
- do not send those extra fields to `/api/users` until the backend model is extended

Suggested next backend contract expansion, when ready:
- extend `User` with profile/setup fields
- add a dedicated dashboard/progress summary DTO
- add a persisted completed-recommendation/session model if workout customization must be saved exactly as generated
