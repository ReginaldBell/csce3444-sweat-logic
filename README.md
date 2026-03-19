# SweatLogic

Fitness tracker for UNT students. Log workouts, generate guided exercise plans, track progress over time, and navigate the UNT Rec Center — no account required.

Built for CSCE 3444 Software Engineering at the University of North Texas.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Java 17 + Spring Boot 3.2 |
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) |
| Database | SQLite via Spring Data JPA |
| Build | Maven |

The frontend is fully static and communicates with the backend through a REST API. All user preferences are stored in `localStorage`; workout data persists in the SQLite database.

---

## Getting Started

**Prerequisites:** Java 17+, Maven 3.8+, modern browser

```bash
# Start backend
cd backend
mvn spring-boot:run
# Runs at http://localhost:8080
# DB is created automatically and seeded with 25 exercises on first run
```

Then open `frontend/index.html` in your browser (or use VS Code Live Server). No frontend build step needed.

---

## Features

- **Guided Workout Planner** — pick a body part, goal, and experience level; generate a real exercise plan with a live session timer and per-exercise checklist
- **Manual Logging** — quickly log workouts by type, duration, and notes
- **Dashboard** — weekly totals, current streak, and recent activity at a glance
- **Progress Tracker** — charts, heatmap, workout type breakdown, and streak history
- **Rec Center Map** — interactive 2-floor floor plan with 20+ clickable zones and live occupancy status
- **BMI Calculator** — imperial and metric support with category and health guidance
- **Settings** — display name and unit preference, persisted locally

---

## API

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workouts` | Fetch all workouts |
| POST | `/workouts` | Log a new workout |
| PUT | `/workouts/{id}` | Update a workout |
| DELETE | `/workouts/{id}` | Delete a workout |
| GET | `/recommendations/generate/{bodyPart}` | Generate a plan (`?goal=&level=`) |
| GET | `/exercises` | Full exercise catalog |

---

## Project Structure

```
csce3444-sweat-logic/
├── backend/
│   └── src/main/java/com/sweatlogic/
│       ├── config/          # CORS config, DB seeding (DataInitializer)
│       ├── controller/      # REST controllers (Workout, Exercise, Recommendation, User)
│       ├── dto/             # WorkoutPlan response shape
│       ├── model/           # JPA entities (Workout, Exercise, User, enums)
│       ├── repository/      # Spring Data JPA repositories
│       └── service/         # Business logic (Recommendation engine, Workout CRUD)
├── frontend/
│   ├── css/
│   │   ├── styles.css       # Global styles and shared component library
│   │   └── map.css          # Map-specific layout and zone card styles
│   ├── js/
│   │   ├── main.js          # Shared animation utilities and API fetch wrapper
│   │   ├── workout.js       # Guided session state machine, timer, plan generation
│   │   ├── progress.js      # Chart.js charts, heatmap, streak calculation
│   │   ├── dashboard.js     # Stat cards, recent activity, weekly summary
│   │   ├── settings.js      # Preference persistence via localStorage
│   │   └── map/             # Modular map system (state, data, render, events, simulate)
│   ├── images/              # Rec center floor plan reference images
│   ├── index.html           # Home — hero, BMI calculator, quick start
│   ├── workout.html         # Guided planner + manual log
│   ├── progress.html        # Progress tracker and charts
│   ├── dashboard.html       # Weekly overview
│   ├── map.html             # Interactive Rec Center map
│   ├── recommendations.html # Body-part recommendation pages
│   └── settings.html        # User preferences
└── docs/
    └── SRS_Group_13_Modified.docx
```

---

## Screenshots

| Page | Description |
|------|-------------|
| **Home** | Hero section with feature overview and BMI calculator |
| **Workout** | Two-path chooser → guided session with live timer, or quick manual log |
| **Progress** | Line charts, activity heatmap, and workout type breakdown |
| **Map** | 2-floor interactive Rec Center map with clickable zones and occupancy badges |
| **Dashboard** | Streak, weekly totals, and recent workout history |

### Home Screenshot

![SweatLogic home screen](screenshots/home-screen.png)



---

## Known Limitations & Future Plans

**Current limitations**
- No user authentication — all workout data is shared in a single SQLite instance
- Rec Center occupancy is simulated; no live data feed connected
- No offline support; the guided session requires the backend to generate a plan

**Potential future improvements**
- User accounts with JWT authentication so each person sees only their own data
- Live occupancy data integration with the UNT Rec Center API (if available)
- Push notifications or reminders for workout streaks
- Export workout history to CSV or PDF
- Native mobile experience via PWA or React Native port

---

## Team

Alejandro Castro · Cash Quigley · Demarcus Bell · Gerardo Martinez · Shalom Tanyi

## Docs

[SRS Document](docs/SRS_Group_13_Modified.docx)

---

*Academic use only — CSCE 3444, University of North Texas.*
