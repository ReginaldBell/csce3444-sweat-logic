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

        save("Cable Fly",             "chest", "strength", 3, "12-15",
             "Set cable pulleys at chest height and stand in the center. Hold a handle in each " +
             "hand, step forward, and bring your hands together in a wide arc in front of your " +
             "chest. Return slowly with control.");

        save("Decline Bench Press",   "chest", "strength", 3, "8-12",
             "Set a bench to a 15–30 degree decline and secure your feet. Grip the bar slightly " +
             "wider than shoulder width, lower it to your lower chest, then press back up.");

        save("Diamond Push-Up",       "chest", "strength", 3, "10-15",
             "Start in a push-up position with your hands close together under your chest, " +
             "forming a diamond shape with your thumbs and forefingers. Lower your chest to " +
             "your hands, then push back up.");

        save("Machine Chest Press",   "chest", "strength", 3, "10-12",
             "Sit at a chest press machine with the handles at chest height. Press the handles " +
             "forward until your arms are fully extended, then return slowly.");

        save("Plyometric Push-Up",    "chest", "cardio",   3, "8-10",
             "Start in a push-up position. Lower your chest to the floor, then push explosively " +
             "so your hands leave the ground. Land softly with slightly bent elbows and " +
             "immediately go into the next rep.");

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

        save("Single-Arm Dumbbell Row", "back", "strength", 3, "10-12 each",
             "Place one hand and knee on a bench for support. Hold a dumbbell in your free hand " +
             "and pull it up to your hip by driving your elbow toward the ceiling. Lower slowly " +
             "and repeat, then switch sides.");

        save("Face Pull",             "back", "strength", 3, "15-20",
             "Attach a rope to a cable machine at face height. Pull the rope toward your face, " +
             "spreading the ends apart as you squeeze your rear delts and upper back. " +
             "Return slowly.");

        save("Good Morning",          "back", "strength", 3, "10-12",
             "Stand with a barbell on your upper back and feet shoulder-width apart. With a " +
             "slight knee bend, hinge forward at the hips until your torso is near parallel to " +
             "the floor, then drive your hips forward to return.");

        save("T-Bar Row",             "back", "strength", 3, "8-10",
             "Straddle a T-bar or landmine setup and hinge forward to grip the handles. Pull " +
             "the weight up toward your chest, squeezing your shoulder blades together at the " +
             "top, then lower with control.");

        save("Renegade Row",          "back", "cardio",   3, "8 each side",
             "Start in a push-up position holding two dumbbells. Row one dumbbell up to your " +
             "hip while balancing on the other, lower it, then alternate sides. Keep your hips " +
             "square throughout.");

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

        save("Romanian Deadlift",     "legs", "strength", 3, "10-12",
             "Stand holding a barbell or dumbbells in front of your thighs. Push your hips back " +
             "and lower the weight down your legs until you feel a deep hamstring stretch, then " +
             "drive your hips forward to stand.");

        save("Bulgarian Split Squat", "legs", "strength", 3, "10 each leg",
             "Stand facing away from a bench and place one foot behind you on it. Lower your " +
             "back knee toward the floor by bending your front knee, then push through your " +
             "front heel to stand. Complete reps on one side before switching.");

        save("Glute Bridge",          "legs", "strength", 3, "15-20",
             "Lie on your back with knees bent and feet flat on the floor. Drive your hips " +
             "toward the ceiling by squeezing your glutes, hold for a second at the top, " +
             "then lower back down.");

        save("Box Jump",              "legs", "cardio",   3, "8-10",
             "Stand in front of a sturdy box. Dip into a quarter squat, swing your arms, and " +
             "explode upward to land softly on top of the box with both feet. Step back down " +
             "and immediately repeat.");

        save("Jumping Squat",         "legs", "cardio",   3, "12-15",
             "Stand with feet shoulder-width apart and lower into a squat. Drive through your " +
             "feet to jump as high as possible, land softly back into the squat position, " +
             "and immediately repeat.");

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

        save("Preacher Curl",         "arms", "strength", 3, "10-12",
             "Sit at a preacher curl bench and rest your upper arms on the pad. Curl the bar " +
             "or dumbbells up toward your shoulders, then lower all the way down for a " +
             "full stretch.");

        save("Overhead Tricep Extension", "arms", "strength", 3, "12-15",
             "Hold a dumbbell or EZ bar overhead with both hands. Lower it behind your head by " +
             "bending only at the elbows, keeping your upper arms still, then extend back to " +
             "the start.");

        save("Close-Grip Bench Press","arms", "strength", 3, "8-12",
             "Lie on a bench and grip the bar with hands shoulder-width apart. Lower the bar " +
             "to your lower chest, keeping your elbows tucked close to your body, " +
             "then press back up.");

        save("Tricep Kickback",       "arms", "strength", 3, "12-15 each",
             "Hinge forward at the hips holding a dumbbell in each hand with upper arms " +
             "parallel to the floor. Extend your forearms straight back until your arms are " +
             "fully extended, then return.");

        save("Shadow Boxing",         "arms", "cardio",   3, "30 sec",
             "Stand in an athletic stance and throw controlled punches — jabs, crosses, hooks, " +
             "and uppercuts — at a steady pace. Keep your core braced and move your feet " +
             "between combinations.");

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

        save("Bicycle Crunch",        "core", "strength", 3, "20 total",
             "Lie on your back with hands behind your head. Bring one knee toward your chest " +
             "while rotating your opposite elbow to meet it. Alternate sides in a pedaling " +
             "motion without letting your feet touch the floor.");

        save("Dead Bug",              "core", "strength", 3, "10 each side",
             "Lie on your back with arms extended toward the ceiling and knees bent at 90 " +
             "degrees. Slowly lower one arm and the opposite leg toward the floor, return, " +
             "and alternate sides while keeping your lower back pressed flat.");

        save("Hanging Knee Raise",    "core", "strength", 3, "12-15",
             "Hang from a pull-up bar with arms fully extended. Draw your knees toward your " +
             "chest by contracting your abs, then lower them back down with control.");

        save("Ab Wheel Rollout",      "core", "strength", 3, "10-12",
             "Kneel on the floor holding an ab wheel in front of you. Roll the wheel forward " +
             "as far as you can while keeping your core tight and back flat, then pull it back " +
             "to the start using your abs.");

        save("Burpee",                "core", "cardio",   3, "10-12",
             "Start standing, drop your hands to the floor, and jump your feet back to a plank. " +
             "Perform a push-up, jump your feet forward, then explosively jump up with your " +
             "arms overhead. Land softly and repeat.");

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

        userRepository.findByUsername("demo_user")
                .orElseGet(() -> userRepository.save(new User("demo_user", "imperial")));

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
