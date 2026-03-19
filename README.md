# SweatLogic

Fitness tracker for UNT students. Log workouts, generate exercise plans, track progress, and navigate the UNT Rec Center — no account required.

Built for CSCE 3444 Software Engineering at the University of North Texas.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Java 17 + Spring Boot 3.2 |
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) |
| Database | SQLite via Spring Data JPA |
| Build | Maven |

## Getting Started

**Prerequisites:** Java 17+, Maven 3.8+, modern browser

```bash
# Start backend
cd backend
mvn spring-boot:run
# Server runs at http://localhost:8080
# DB created automatically, seeded with 25 exercises on first run
```

Open `frontend/index.html` in your browser (or use VS Code Live Server).

## Features

- **Workout Planner** — generate plans by body part, goal, and experience level
- **Manual Logging** — log workouts by type, duration, and notes
- **Dashboard** — weekly stats, streak, and recent activity
- **Progress** — totals, averages, and workout type breakdown
- **Rec Center Map** — interactive 2-floor floor plan with 20+ clickable zones
- **BMI Calculator** — imperial/metric with category and recommendation
- **Settings** — display name and unit preference (localStorage)

## API

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workouts` | All workouts |
| POST | `/workouts` | Log a workout |
| PUT | `/workouts/{id}` | Update a workout |
| DELETE | `/workouts/{id}` | Delete a workout |
| GET | `/recommendations/generate/{bodyPart}` | Generate plan (`?goal=&level=`) |
| GET | `/exercises` | Full exercise catalog |

## Team

Alejandro Castro · Cash Quigley · Demarcus Bell · Gerardo Martinez · Shalom Tanyi

## Docs

[SRS Document](docs/SRS_Group_13_Modified.docx)

---

*Academic use only — CSCE 3444, University of North Texas.*
