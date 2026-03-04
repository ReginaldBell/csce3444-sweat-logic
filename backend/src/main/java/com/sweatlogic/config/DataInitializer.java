package com.sweatlogic.config;

import com.sweatlogic.model.Exercise;
import com.sweatlogic.model.User;
import com.sweatlogic.model.Workout;
import com.sweatlogic.repository.ExerciseRepository;
import com.sweatlogic.repository.UserRepository;
import com.sweatlogic.repository.WorkoutRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds the database with reference data and sample data on first startup.
 *
 * CommandLineRunner means this code runs automatically right after
 * Spring Boot finishes starting up. Each section guards itself with a
 * count check so re-running the app never overwrites existing data.
 *
 * Seeding order:
 *   1. Exercise catalog  — deterministic reference data, seeded by name so
 *                          it is safe to run on every startup (idempotent).
 *   2. Demo user         — only created when the users table is empty.
 *   3. Sample workouts   — only created when the workouts table is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutRepository  workoutRepository;
    private final UserRepository     userRepository;

    public DataInitializer(ExerciseRepository exerciseRepository,
                           WorkoutRepository  workoutRepository,
                           UserRepository     userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.workoutRepository  = workoutRepository;
        this.userRepository     = userRepository;
    }

    @Override
    public void run(String... args) {
        seedExercises();
        seedDemoData();
    }

    // -------------------------------------------------------------------------
    // Exercise catalog — 25 predefined exercises across 5 body parts
    //
    // Each entry is only inserted if an exercise with that name does not already
    // exist, making this block safe to run on every application startup.
    // -------------------------------------------------------------------------
    private void seedExercises() {

        // --- Chest ---
        save("Bench Press",           "chest", "strength", 3, "8-12",
             "Lie flat on a bench. Grip the bar just outside shoulder width. " +
             "Lower the bar to your chest, then press it back to the start.");

        save("Push-Up",               "chest", "strength", 3, "12-15",
             "Start in a high plank, hands shoulder-width apart. " +
             "Lower your chest to the floor, then push back up keeping your core tight.");

        save("Incline Dumbbell Press","chest", "strength", 3, "10-12",
             "Set a bench to 30-45 degrees. Press dumbbells from chest height " +
             "straight up, then lower them slowly back down.");

        save("Chest Fly",             "chest", "strength", 3, "12-15",
             "Lie on a flat bench holding dumbbells above your chest. " +
             "Open your arms in a wide arc until you feel a stretch, then squeeze back together.");

        save("Dip",                   "chest", "strength", 3, "8-12",
             "Grip parallel bars and lower your body until your upper arms are parallel " +
             "to the floor. Press back up to the start.");

        // --- Back ---
        save("Pull-Up",               "back", "strength", 3, "6-10",
             "Hang from a bar with palms facing away. Pull your chest toward the bar, " +
             "then lower yourself with control.");

        save("Bent-Over Row",         "back", "strength", 3, "8-12",
             "Hinge forward at the hips holding a barbell. Pull the bar to your lower " +
             "chest, squeezing your shoulder blades together at the top.");

        save("Lat Pulldown",          "back", "strength", 3, "10-12",
             "Sit at a cable machine and grip the bar wide. Pull the bar down to your " +
             "upper chest while keeping your torso upright.");

        save("Seated Cable Row",      "back", "strength", 3, "10-12",
             "Sit at a low cable pulley. Pull the handle to your abdomen, " +
             "keeping your back straight and elbows close to your sides.");

        save("Deadlift",              "back", "strength", 3, "5-8",
             "Stand with the bar over your mid-foot. Hinge down to grip the bar, " +
             "brace your core, then drive through the floor to stand up fully.");

        // --- Legs ---
        save("Squat",                 "legs", "strength", 3, "8-12",
             "Stand with feet shoulder-width apart. Push your hips back and bend your " +
             "knees until your thighs are parallel to the floor, then drive back up.");

        save("Leg Press",             "legs", "strength", 3, "10-12",
             "Sit in the leg press machine with feet hip-width on the platform. " +
             "Lower the sled until knees reach 90 degrees, then press back up.");

        save("Lunge",                 "legs", "strength", 3, "10 each leg",
             "Step one foot forward and lower your back knee toward the floor. " +
             "Push through your front heel to return to standing, then alternate legs.");

        save("Leg Curl",              "legs", "strength", 3, "12-15",
             "Lie face-down on the leg curl machine. Curl your heels toward your glutes, " +
             "then lower with control.");

        save("Calf Raise",            "legs", "strength", 3, "15-20",
             "Stand on the edge of a step with heels hanging off. Rise up onto your toes " +
             "as high as possible, then lower below the step level.");

        // --- Arms ---
        save("Bicep Curl",            "arms", "strength", 3, "10-12",
             "Stand holding dumbbells at your sides. Curl them toward your shoulders " +
             "without swinging your elbows, then lower with control.");

        save("Tricep Pushdown",       "arms", "strength", 3, "12-15",
             "Stand at a cable machine with a rope or bar attachment. " +
             "Push the handle down until your arms are fully extended, then return slowly.");

        save("Hammer Curl",           "arms", "strength", 3, "10-12",
             "Hold dumbbells with a neutral grip (palms facing each other). " +
             "Curl them toward your shoulders, keeping your elbows fixed at your sides.");

        save("Skull Crusher",         "arms", "strength", 3, "10-12",
             "Lie on a bench holding a barbell above your chest. Bend only at the elbows " +
             "to lower the bar toward your forehead, then extend back up.");

        save("Concentration Curl",    "arms", "strength", 3, "12 each arm",
             "Sit on a bench and brace your elbow against your inner thigh. " +
             "Curl the dumbbell up slowly, then lower it all the way down.");

        // --- Core ---
        save("Plank",                 "core", "strength", 3, "30-60 sec",
             "Hold a forearm plank with your body in a straight line from head to heel. " +
             "Brace your abs and glutes — do not let your hips sag or rise.");

        save("Crunch",                "core", "strength", 3, "15-20",
             "Lie on your back with knees bent. Curl your shoulders off the floor by " +
             "contracting your abs, then lower slowly.");

        save("Russian Twist",         "core", "strength", 3, "20 total",
             "Sit with knees bent and feet lifted slightly. Rotate your torso side to " +
             "side, touching the floor (or a weight) on each rep.");

        save("Leg Raise",             "core", "strength", 3, "12-15",
             "Lie flat with hands under your lower back. Keeping legs straight, " +
             "raise them to 90 degrees then lower them without letting them touch the floor.");

        save("Mountain Climber",      "core", "cardio",   3, "30 sec",
             "Start in a high plank. Drive your knees alternately toward your chest " +
             "as fast as you can while keeping your hips level.");

        System.out.println("Exercise catalog ready (" + exerciseRepository.count() + " exercises).");
    }

    // Saves an exercise only if one with the same name does not already exist.
    private void save(String name, String bodyPart, String category,
                      int sets, String reps, String instructions) {
        if (!exerciseRepository.existsByName(name)) {
            exerciseRepository.save(
                new Exercise(name, bodyPart, category, sets, reps, instructions)
            );
        }
    }

    // -------------------------------------------------------------------------
    // Demo user + sample workouts — skipped if data already exists
    // -------------------------------------------------------------------------
    private void seedDemoData() {
        if (workoutRepository.count() > 0) {
            return;
        }

        User user = new User("demo_user", "imperial");
        userRepository.save(user);

        LocalDateTime now = LocalDateTime.now();

        workoutRepository.save(new Workout("running", 30, "Morning jog around campus",       now.minusDays(1)));
        workoutRepository.save(new Workout("weights", 45, "Chest and triceps day",           now.minusDays(2)));
        workoutRepository.save(new Workout("cycling", 60, "Bike ride on the trail",          now.minusDays(3)));
        workoutRepository.save(new Workout("running", 25, "Interval sprints at the track",   now.minusDays(4)));
        workoutRepository.save(new Workout("weights", 50, "Back and biceps day",             now.minusDays(5)));
        workoutRepository.save(new Workout("other",   40, "Yoga and stretching session",     now.minusDays(6)));
        workoutRepository.save(new Workout("running", 35, "Trail run at the park",           now.minusDays(8)));
        workoutRepository.save(new Workout("cycling", 45, "Evening ride downtown",           now.minusDays(9)));
        workoutRepository.save(new Workout("weights", 55, "Leg day — squats and lunges",     now.minusDays(10)));
        workoutRepository.save(new Workout("running", 20, "Quick recovery run",              now.minusDays(12)));
        workoutRepository.save(new Workout("other",   30, "Swimming laps at the rec center", now.minusDays(13)));
        workoutRepository.save(new Workout("weights", 40, "Shoulders and core",              now.minusDays(14)));

        System.out.println("Demo data seeded: 1 user, 12 sample workouts.");
    }
}
