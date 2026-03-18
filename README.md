# SweatLogic

A web-based fitness tracker built for UNT students. Log workouts, generate personalized exercise plans, track progress, and navigate the UNT Rec Center — no account required.

Built for CSCE 3444 Software Engineering at the University of North Texas.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Team](#team)
- [Known Limitations](#known-limitations)
- [License](#license)

## Overview

SweatLogic helps UNT students maintain consistent fitness routines by combining workout logging, rule-based plan generation, and an interactive Rec Center map in one place. The backend runs on Spring Boot with a SQLite database. The frontend is plain HTML/CSS/JS — open any page in a browser while the backend is running.

## Features

### Workout Planner
- Select a body part (chest, back, legs, arms, core) to instantly generate a workout plan
- Plans are filtered by your goal (strength, cardio, endurance) and experience level (beginner, intermediate, advanced)
- Beginner: 3 exercises · Intermediate: 4 · Advanced: 5
- Complete a generated plan to log it directly to your history

### Manual Workout Logging
- Log any workout by type (running, cycling, weights, other), duration, and optional notes
- All logs saved to SQLite via REST API

### Dashboard
- Weekly workout count, total minutes, and average session duration
- Current streak and recent activity feed

### Progress Tracking
- Total workouts and hours, average session length
- Current and longest streak
- Workout type breakdown (running, cycling, weights, other) with percentage bars

### Interactive Rec Center Map
- 2-floor interactive floor plan of the UNT Recreation Center
- 20+ clickable zones color-coded by group (fitness, aquatics, courts, recreation, services)
- Side panel shows capacity, equipment, and hours for each zone

### BMI Calculator
- Calculates BMI from height and weight (imperial or metric)
- Returns a category and personalized fitness recommendation

### Settings
- Display name and measurement unit (imperial/metric) saved locally

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Java 17 + Spring Boot 3.2.0 |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Database** | SQLite 3 (via Spring Data JPA + Hibernate) |
| **Build Tool** | Maven |
| **Version Control** | Git & GitHub |
| **IDE** | Visual Studio Code |
| **Hosting** | Render (planned) |

## Project Status

**Status:** In Development — core features complete

| Feature | Status |
|---------|--------|
| Workout logging (manual) | Complete |
| Workout plan generation | Complete |
| Dashboard with live stats | Complete |
| Progress tracking + streaks | Complete |
| Interactive Rec Center map | Complete |
| BMI calculator | Complete |
| Settings (name, units) | Complete |
| Progress charts (Chart.js) | Planned |
| Fitness preferences sync to backend | Planned |
| Multi-user accounts | Out of scope |

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- A modern browser (Chrome, Firefox, Edge)

### 1. Start the backend
```bash
cd backend
mvn spring-boot:run
```
The server starts on `http://localhost:8080`. The database (`sweat-logic.db`) is created automatically and seeded with 25 exercises on first run.

### 2. Open the frontend
Open `frontend/index.html` in your browser, or serve it with any static file server (e.g. VS Code Live Server on port 3000/5500).

The frontend connects to `http://localhost:8080/api` automatically.

## Project Structure

```
sweat-logic/
├── frontend/
│   ├── index.html          # Landing page + BMI calculator
│   ├── dashboard.html      # Weekly stats + recent activity
│   ├── workout.html        # Plan generation + manual logging
│   ├── progress.html       # Historical stats + type breakdown
│   ├── map.html            # Interactive Rec Center floor plan
│   ├── settings.html       # Display name + unit preference
│   ├── css/
│   │   ├── styles.css      # Global styles, animations, components
│   │   └── map.css         # Map-specific styles
│   └── js/
│       ├── main.js         # API fetch wrapper, animations, BMI calc
│       ├── dashboard.js
│       ├── workout.js
│       ├── progress.js
│       ├── settings.js
│       └── map/            # Modular map (state, data, render, events)
│
└── backend/
    └── src/main/java/com/sweatlogic/
        ├── controller/     # REST endpoints (Workout, Recommendation, Exercise, User)
        ├── service/        # Business logic
        ├── model/          # JPA entities (Workout, Exercise, User) + enums
        ├── repository/     # Spring Data JPA interfaces
        ├── dto/            # WorkoutPlan response DTO
        └── config/         # CORS (WebConfig), data seeding (DataInitializer)
```

## API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workouts` | All workouts (newest first) |
| POST | `/workouts` | Create a workout log |
| PUT | `/workouts/{id}` | Update a workout |
| DELETE | `/workouts/{id}` | Delete a workout |
| GET | `/recommendations/generate/{bodyPart}` | Generate a workout plan |
| GET | `/exercises` | Full exercise catalog |
| GET | `/exercises/by-body-part/{bodyPart}` | Exercises filtered by body part |

**Recommendation query params:** `?goal=strength&level=intermediate`
Valid goals: `strength`, `cardio`, `endurance`
Valid levels: `beginner`, `intermediate`, `advanced`

## Team

- Alejandro Castro
- Cash Quigley
- Demarcus Bell
- Gerardo Martinez
- Shalom Tanyi

## Known Limitations

- **Single-user mode** — no authentication; profile data stored in localStorage
- **Static map** — zone occupancy is simulated, not real-time
- **Rule-based recommendations** — no AI/ML; exercises filtered and shuffled by goal and level
- **No charts yet** — progress page type breakdown uses CSS bars; Chart.js integration planned

## Documentation

- [Software Requirements Specification (SRS)](docs/SRS_Group_13_Modified.docx)

## License

Developed as coursework for CSCE 3444 at the University of North Texas. Academic use only.
