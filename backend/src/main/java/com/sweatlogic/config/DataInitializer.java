package com.sweatlogic.config;

import com.sweatlogic.model.User;
import com.sweatlogic.model.Workout;
import com.sweatlogic.repository.UserRepository;
import com.sweatlogic.repository.WorkoutRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds the database with sample data on first startup.
 *
 * CommandLineRunner means this code runs automatically right after
 * Spring Boot finishes starting up. It checks if the database is
 * empty — if so, it inserts a demo user and 12 sample workouts
 * so the app has something to display right away.
 *
 * On future startups, it detects existing data and skips seeding,
 * so your real data is never overwritten.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    // Spring injects both repositories automatically
    public DataInitializer(WorkoutRepository workoutRepository, UserRepository userRepository) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // If there's already data in the workouts table, don't seed again
        if (workoutRepository.count() > 0) {
            return;
        }

        // Create a default demo user with imperial units
        User user = new User("demo_user", "imperial");
        userRepository.save(user);

        // Insert 12 realistic sample workouts spread over the past 2 weeks.
        // This gives the dashboard and progress pages something to show on day one.
        LocalDateTime now = LocalDateTime.now();

        workoutRepository.save(new Workout("running",    30, "Morning jog around campus",           now.minusDays(1)));
        workoutRepository.save(new Workout("weights",    45, "Chest and triceps day",               now.minusDays(2)));
        workoutRepository.save(new Workout("cycling",    60, "Bike ride on the trail",              now.minusDays(3)));
        workoutRepository.save(new Workout("running",    25, "Interval sprints at the track",       now.minusDays(4)));
        workoutRepository.save(new Workout("weights",    50, "Back and biceps day",                 now.minusDays(5)));
        workoutRepository.save(new Workout("other",      40, "Yoga and stretching session",         now.minusDays(6)));
        workoutRepository.save(new Workout("running",    35, "Trail run at the park",               now.minusDays(8)));
        workoutRepository.save(new Workout("cycling",    45, "Evening ride downtown",               now.minusDays(9)));
        workoutRepository.save(new Workout("weights",    55, "Leg day — squats and lunges",         now.minusDays(10)));
        workoutRepository.save(new Workout("running",    20, "Quick recovery run",                  now.minusDays(12)));
        workoutRepository.save(new Workout("other",      30, "Swimming laps at the rec center",     now.minusDays(13)));
        workoutRepository.save(new Workout("weights",    40, "Shoulders and core",                  now.minusDays(14)));

        System.out.println("Database seeded with 1 user and 12 sample workouts.");
    }
}
