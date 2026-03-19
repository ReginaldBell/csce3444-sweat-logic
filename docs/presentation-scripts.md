# SweatLogic — Presentation Scripts

**Slide Distribution:**
- **Demarcus Bell** — Slides 1–3 (Title, Problem, Core Features)
- **Alejandro Castro** — Slides 4–5 (App Ecosystem, Interaction Loop)
- **Cash Quigley** — Slides 6–7 (Live Demo, Requirements)
- **Gerardo Martinez** — Slides 8–9 (Architecture, Accessibility)
- **Shalom Tanyi** — Slides 10–13 (Class Diagram, Activity, Sequence, Metrics)

---

## DEMARCUS BELL — Slides 1–3

### Slide 1: Title / Home Screen

> "Good [morning/afternoon], everyone. Our project is called **SweatLogic** — a fitness web application built specifically for UNT students. The idea is simple: give students everything they need to plan, track, and navigate their gym experience in one clean, unified platform. You can see the core navigation at the top — Home, Dashboard, Workout, Progress, Map, and Settings. Each of those represents a fully built-out feature. I'll hand it off to the team in a moment, but first let me walk you through the problem we set out to solve."

---

### Slide 2: The Barriers to Student Fitness Consistency

> "When we looked at why students struggle to stay consistent at the gym, three problems kept coming up. First, **lack of structured workout guidance** — most students don't have a trainer, and they don't know how to build an effective plan on their own. Second, **difficulty navigating the Rec Center** — the facility is large, and for a new student, finding the right equipment in the right zone can be genuinely confusing. Third, **no system for tracking progress** — without a way to see improvement over time, motivation drops. Students can't see their streaks, their history, or whether their effort is actually paying off. These three problems all point to the same root cause: students lack a unified system to plan, track, and navigate fitness activities. That's the gap SweatLogic fills."

---

### Slide 3: Core Features

> "So here's how we address each of those problems. **Personalized Workouts** — the system generates a custom plan instantly based on whichever muscle group you select. No guesswork, no research required. **Progress Tracking** — users can monitor their workout metrics and stay motivated through streaks, so they always know where they stand. And **Interactive Map** — we built a navigable map of the UNT Rec Center so students can find exactly what they need before they even walk in the door. Together, these three features deliver the core benefit: **a unified system for seamless fitness**. I'll pass it over to Alejandro, who will walk you through how all these pieces fit together as an application."

---

### Questions You May Be Asked (Slides 1–3)

**Q: Why did you choose to build this for UNT specifically?**
> A: The UNT Rec Center is a real facility with a real layout, and UNT students are our target users. Building for a specific context let us make design decisions — like the interactive map — that are actually useful rather than generic.

**Q: Is there an existing app that already does this?**
> A: There are general fitness apps like MyFitnessPal or Nike Training Club, but none of them are tied to the UNT Rec Center, none of them integrate facility navigation, and they all require accounts. SweatLogic requires no authentication and is purpose-built for this campus.

**Q: Why no authentication?**
> A: Keeping the barrier to entry low was a deliberate design choice. One of the reasons students don't use fitness tools is friction — having to sign up and log in is one more reason to skip it. We wanted the tool usable the moment you open it.

**Q: What fitness goals does SweatLogic support?**
> A: The user profile includes a `fitnessGoal` field that the system uses when recommending exercises. Goals like strength, endurance, or weight loss influence what the workout generator produces.

---

---

## ALEJANDRO CASTRO — Slides 4–5

### Slide 4: A Fully Integrated Application Ecosystem

> "As Demarcus showed us the three core features, let me show you how those features are organized across the full application. SweatLogic is made up of **six distinct modules**. The **Home Screen** is the central hub — it surfaces quick access to all other features. The **Workout Planner** is where users generate and customize their session. The **Dashboard** shows live metrics like today's streak and recent activity. **Progress Analytics** gives you your full workout history and performance trends over time. The **Rec Center Map** is our interactive navigation tool for the facility. And **Settings** handles profile preferences. Every one of these modules is fully built and connected. The key design principle here was responsiveness — animations and real-time feedback throughout so the app always feels alive."

---

### Slide 5: The Core Interaction Loop

> "Here's the most important user flow in the app — what we call the **core interaction loop**. It's designed to get you from zero to a tracked workout in two clicks. Step 1: **Select a body part** — chest, legs, back, arms, core. Step 2: **Generate a plan** — the system automatically creates a workout using rule-based exercise selection. Step 3: **Complete the workout** — you perform the session and confirm it. Step 4: **Track your progress** — the dashboard and streak update in real time. That's it. No filler, no unnecessary steps. This loop is the heart of the user experience, and everything else in the app supports it."

---

### Questions You May Be Asked (Slides 4–5)

**Q: How does the workout generator decide which exercises to include?**
> A: It's rule-based — the backend queries the SQLite exercise database by body part and returns a filtered list. The system scales the number of exercises to the duration the user enters.

**Q: Can a user customize the generated workout before doing it?**
> A: Yes — the activity diagram shows an "Accept Workout?" decision point. If the user doesn't like the recommended exercises, they can add or remove exercises before starting.

**Q: What happens if someone selects multiple body parts?**
> A: The backend accepts a set of target body parts and queries for exercises matching any of them, then combines the results into one workout plan.

**Q: Does the streak reset if you miss a day?**
> A: Yes. The Progress entity has both `currentStreak` and `longestStreak`. If `lastWorkoutDate` shows a gap, `resetStreak()` is called the next time the user logs a session.

---

---

## CASH QUIGLEY — Slides 6–7

### Slide 6: Live System Demonstration

> "Let me walk you through exactly what the system does in a live session, using a concrete example. Imagine a student walks into the Rec Center wanting to work on legs. Step 1 — they open the Workout page and **select 'Legs'** from the target muscle dropdown. Step 2 — they hit generate, and the system **auto-creates a plan** using our rule-based engine — no manual input required. Step 3 — they **enter a duration** of 45 minutes, and the system scales the exercise volume accordingly. Step 4 — they complete the session and **log the workout**. Step 5 — they navigate to the Dashboard and can immediately see that **their streak has updated**. That entire flow is live and functional in our system right now."

---

### Slide 7: Engineering Parameters and System Requirements

> "On the engineering side, we organized our requirements into two categories. **Functional requirements** — the things the system must actually do: workout logging and tracking, rule-based workout generation, interactive facility mapping, and real-time performance analytics. All four are implemented. **Non-functional requirements** — the quality standards the system must meet: instant responsiveness with no perceived lag, an adaptive UI that works across device sizes, robust API reliability so the backend handles requests cleanly, WCAG accessibility compliance, and no authentication barrier. These requirements shaped every technical decision we made — from the stack we chose to the way we structured the API."

---

### Questions You May Be Asked (Slides 6–7)

**Q: What does "rule-based" mean — why not use machine learning?**
> A: Rule-based means the exercise selection is driven by filters and logic, not a trained model. For a first deliverable with a fixed dataset, this is more predictable, debuggable, and appropriate for the scope. ML would require training data we don't have yet.

**Q: How do you handle the duration scaling?**
> A: The backend uses the duration input to calculate how many exercises and sets to include. Longer duration = more volume. The logic lives in `WorkoutService.generateWorkout()`.

**Q: What does "instant responsiveness" mean technically?**
> A: It means the UI doesn't block on API calls — while the backend processes, the frontend shows a loading state, and when the response arrives, it renders without a page reload. All API interactions are async.

**Q: Is the map actually interactive or is it a static image?**
> A: It's interactive — it shows equipment zones and areas of the Rec Center that users can navigate. The facility navigation was one of our core differentiators.

---

---

## GERARDO MARTINEZ — Slides 8–9

### Slide 8: Full-Stack Architecture and Data Flow

> "Now let me walk you through how the system is actually built under the hood. When a user selects a body part, the request flows through five stages. The **Frontend** — built with vanilla JavaScript in `workout.js` — sends a `GET /api/recommendations` request to the backend. The **Backend** is a **Spring Boot** application. It routes the request to `WorkoutService`, which calls `ExerciseService` to query **SQLite** — filtering exercises by body part. The exercise list comes back, the workout is assembled, and a `200 OK` JSON response is returned to the frontend. The UI renders the plan. When the user marks the workout complete, the frontend sends a `POST /api/workouts`, the backend updates the workout record and calls `ProgressService` to increment the streak and update the stats. The dashboard then reflects those changes. Every arrow on this diagram is a real, working API call in our system."

---

### Slide 9: Engineered for Global Accessibility Standards

> "Accessibility wasn't an afterthought — it was built into the design from the start. SweatLogic meets **WCAG standards** across five dimensions. **Semantic Structure** — we used standard HTML semantic tags throughout so screen readers can parse the page correctly. **ARIA Integration** — dynamic UI updates include ARIA attributes so assistive technologies can announce changes. **Full Keyboard Control** — every interactive element is reachable and operable via Tab key alone. **Reduced Motion** — users can disable animations if they have vestibular sensitivities. And **High Contrast** — all color combinations meet WCAG AA contrast ratios, ensuring readability for colorblind users. The goal was a platform that every UNT student can use, regardless of ability."

---

### Questions You May Be Asked (Slides 8–9)

**Q: Why Spring Boot and SQLite specifically?**
> A: Spring Boot gives us a mature, well-structured REST API framework with built-in dependency injection and repository patterns. SQLite is lightweight, file-based, and perfect for a project at this scale — no database server to configure or maintain.

**Q: Why vanilla JS on the frontend instead of React or Vue?**
> A: Keeping the frontend in vanilla JavaScript reduced complexity and dependencies. The interactivity needed — DOM updates, fetch calls, sessionStorage — is achievable without a framework, and it keeps the stack simple and easy to demo.

**Q: What WCAG level are you targeting — A, AA, or AAA?**
> A: We target **WCAG AA**, which is the standard required for most public-facing web applications. The slide references "AA High Contrast" specifically, which is the AA contrast ratio requirement of 4.5:1 for normal text.

**Q: How does the frontend update the dashboard after a workout without a full page reload?**
> A: After the `POST /api/workouts` response comes back, the frontend JavaScript directly updates the relevant DOM elements — streak count, recent workout list — using the data in the JSON response. No full reload needed.

---

---

## SHALOM TANYI — Slides 10–13

### Slide 10: Class Diagram

> "This is the data model that drives the entire system. We have five core entities. **User** stores the student's profile — name, age, height, weight, and fitness goal. **Exercise** represents a single exercise in our database — name, body part, sets, reps, difficulty. **Workout** is a planned or completed session tied to a user on a specific date, with a set of target body parts and a completion flag. **WorkoutExercise** is the join between a workout and an exercise — it records the actual sets, reps, and weight the user logged. And **Progress** tracks long-term stats: total workouts, current streak, longest streak, and last workout date. Each entity has a corresponding **Service** class containing the business logic, and each Service uses a **Repository** to talk to the database. This is a clean layered architecture — presentation, service, and data layers are fully separated."

---

### Slide 11: Activity Diagram

> "The activity diagram shows the full user journey through the app. A student opens the app — if no profile exists, they create one and set their fitness goals. Otherwise they land on the **Dashboard**. From there they choose to either start a workout or view progress. The workout flow goes: select target body parts → system generates a recommendation → user reviews the exercises → if they don't like it, they can add or remove exercises → they accept and perform the workout → log sets, reps, and weight for each exercise → mark the workout complete → system updates progress and streak → view a completion summary. The progress flow lets them view their calendar, streak stats, goal progress, and edit their profile. Every branch in this diagram corresponds to an actual conditional in the code."

---

### Slide 12: Sequence Diagram

> "The sequence diagram drills into the two most important backend flows. **Flow 1 — Generate Workout:** The student selects body parts on the frontend. The frontend posts to `/api/workouts/generate`. The `WorkoutController` calls `WorkoutService.generateWorkout()`, which calls `ExerciseService.recommendExercises()`, which runs a SQL SELECT against the exercise table. The results come back up the chain, the workout is inserted into the database, and a `200 OK` with the full workout JSON is returned to the frontend. **Flow 2 — Complete Workout:** The student clicks 'Mark Complete'. A PUT request goes to `/api/workouts/{id}/complete`. The backend fetches the workout, calls `markComplete()`, updates the record, then calls `ProgressService.updateProgress()` which increments the streak and updates the stats. The frontend receives the updated data and shows the confirmation."

---

### Slide 13: Project Execution and Delivery Metrics

> "To close out — here's where we landed. Five team members: developers, designers, and managers, all contributing across the sprint. One sprint — meaning we delivered full end-to-end functionality in a single iteration: workout generation, logging, progress tracking, the interactive map, and the dashboard are all live. Over 100 hours of total development time invested across the team. The key milestone is that we delivered a complete, working system — not a prototype, not a mockup. Every flow you saw today — from selecting a body part to watching your streak update — works in the running application. We're proud of what we built and we're happy to answer any questions."

---

### Questions You May Be Asked (Slides 10–13)

**Q: Why is WorkoutExercise a separate entity instead of just a list inside Workout?**
> A: It's a junction table pattern. A workout contains many exercises, and an exercise can appear in many workouts. The `WorkoutExercise` entity is where the per-session performance data — actual sets, reps, and weight — lives. You need that separation to log what the user actually did vs. what was planned.

**Q: How does the streak calculation handle edge cases like working out twice in one day?**
> A: The Progress entity tracks `lastWorkoutDate` as a `LocalDate`. If the current workout date equals `lastWorkoutDate`, the streak doesn't increment again. It only increments when the date is new.

**Q: What would Sprint 2 look like?**
> A: Likely additions include user-selectable fitness goal types, weight/rep progression tracking over time, notifications or reminders, and potentially a more sophisticated recommendation algorithm.

**Q: How is the data persisted between sessions — does it survive a page refresh?**
> A: Yes — workout and progress data is stored in the backend SQLite database, so it persists across sessions. The frontend also uses `sessionStorage` during an active guided workout session to maintain state across steps without losing progress if the user navigates between pages.

**Q: What was the hardest part of building this?**
> A: Coordinating the frontend state machine with the backend API — specifically making sure the guided session flow (select → generate → perform → complete) stayed consistent even if the user navigated away mid-session. We solved that with a `sessionStorage`-backed state machine on the frontend.
