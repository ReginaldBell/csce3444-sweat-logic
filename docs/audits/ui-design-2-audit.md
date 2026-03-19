# UI Design 2 Audit

Audit target:
- `C:\Users\User\Downloads\ui design 2`

Audit basis:
- current backend contracts
- `docs/ui-data-contracts.md`
- `docs/vercel-ui-prompt-spec.md`
- extracted SRS expectations already reviewed earlier

## Findings

### High

- `components/sweatlogic-logo.tsx` still uses `/placeholder-logo.svg` instead of the real SweatLogic logo.
  Impact:
  - branding is still not actually integrated
  - the UI may look correct structurally but is still carrying placeholder assets
  Fix:
  - replace the placeholder asset with the real logo file
  - keep the component API the same and only swap the asset path if possible

- `app/(app)/settings/page.tsx` says “These settings are synced with your account,” but the app has no real account/auth flow and these values are still driven by demo/local state.
  Impact:
  - misleading against current implementation
  - implies backend support that does not exist yet
  Fix:
  - change copy to something like “Backend-safe fields” or “Saved profile preferences”
  - keep the existing UI-only badge language for planned fields

- `app/(app)/settings/page.tsx` save behavior is fake and only toggles a temporary success state.
  Impact:
  - looks integrated when it is not
  - can confuse implementation planning
  Fix:
  - either label save behavior as prototype-only
  - or replace it during integration with real `/api/users` calls

### Medium

- `app/(app)/dashboard/page.tsx` and `app/(app)/progress/page.tsx` still rely entirely on `demoWorkouts` and `demoUser` from `lib/data.ts`.
  Impact:
  - no real backend integration yet
  - visual output may drift from actual runtime data
  Fix:
  - replace with API-backed data in the integration phase

- `app/(app)/dashboard/page.tsx` shows a “Today’s Recommendation” card with hard-coded content rather than recommendation API data.
  Impact:
  - UI concept is good, but content is not backed by real contract data
  Fix:
  - either label as placeholder/demo
  - or wire to `/api/recommendations/generate/{bodyPart}` later

- `app/(app)/progress/page.tsx` computes streak, totals, and monthly activity from demo data, not backend data.
  Impact:
  - conceptually acceptable for prototype
  - not integration-ready yet
  Fix:
  - replace with real workouts fetched from `/api/workouts`

- `app/(app)/workout/page.tsx` generates workout plans in the frontend using `generateWorkoutPlan()` from `lib/data.ts`.
  Impact:
  - duplicates backend recommendation logic
  - risks drift from actual recommendation API behavior
  Fix:
  - replace generation with real calls to `/api/recommendations/generate/{bodyPart}?goal={goal}&level={level}`

### Low

- `app/(app)/settings/page.tsx` includes UI-only fields that are ahead of the backend: `heightCm`, `weightKg`, `age`, `gender`, `goal`, `experienceLevel`.
  Impact:
  - not inherently wrong
  - only safe because the page already labels them as UI-only
  Fix:
  - keep this separation explicit during integration

- `app/page.tsx` and other pages use strong prototype/demo copy such as “500+ Exercises” and “24/7 Access.”
  Impact:
  - may be acceptable for prototype polish
  - may not reflect verified project facts
  Fix:
  - either verify these claims or tone them down before production/demo signoff

## What Is Correct

- color palette is much closer to the requested green/white/blue identity
- the design is significantly less generic than the first export
- motion, gradients, glow, and layout treatment are improved
- logo placement structure exists in the design system
- `Exercise.category` was corrected to `strength | cardio | flexibility`
- `Workout`, `WorkoutPlan`, and `UserProfile` are modeled separately
- UI-only profile fields are clearly separated in the settings screen
- the page set matches the intended product structure:
  - home
  - dashboard
  - workout
  - progress
  - map
  - settings

## Integration Readiness

Current readiness level:
- **Design-ready**: yes
- **Contract-aware**: mostly yes
- **Backend-integrated**: no
- **Ready to import into repo as new frontend base**: yes
- **Ready to replace legacy frontend immediately**: no

## Pre-Integration Fix Checklist

Complete these before or during import:

1. Replace placeholder logo asset with the real SweatLogic logo.
2. Remove misleading “account synced” language from settings.
3. Mark any remaining fake-save behavior as prototype-only until real API wiring exists.
4. Keep `lib/data.ts` only as mock data, not as runtime truth.
5. Create `lib/contracts.ts` based on `docs/ui-data-contracts.md`.
6. Create `lib/api.ts` for real backend requests.
7. Wire pages in this order:
   - settings
   - dashboard
   - workout
   - progress
   - map
   - landing

## Recommendation

Use `ui design 2` as the integration candidate.

Do not do another full redesign pass.
Do a short cleanup pass focused on:
- real logo asset
- honest copy
- removal of prototype ambiguity

Then import it as a new frontend app and wire it page-by-page to the existing backend.
