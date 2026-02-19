package com.sweatlogic.service;

import com.sweatlogic.model.Workout;
import com.sweatlogic.repository.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * The brains behind workout operations.
 * This is the middle layer between the controller (handles HTTP requests)
 * and the repository (talks to the database).
 *
 * Why have a service layer? It keeps our business logic separate from
 * the web layer. For example, if the user forgets to include a date,
 * we automatically set it to "right now" — that logic lives here,
 * not in the controller.
 */
@Service
public class WorkoutService {

    // We use the repository to actually read/write data in the database
    private final WorkoutRepository workoutRepository;

    // Spring automatically injects the repository here (constructor injection)
    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    // Grab every workout from the database, newest first
    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAllByOrderByDateDesc();
    }

    // Find one specific workout by its ID
    public Optional<Workout> getWorkoutById(Long id) {
        return workoutRepository.findById(id);
    }

    // Get workouts between two dates (e.g., "this week" or "this month")
    public List<Workout> getWorkoutsInRange(LocalDateTime start, LocalDateTime end) {
        return workoutRepository.findByDateBetweenOrderByDateDesc(start, end);
    }

    // Save a new workout — if no date was provided, default to right now
    public Workout saveWorkout(Workout workout) {
        if (workout.getDate() == null) {
            workout.setDate(LocalDateTime.now());
        }
        return workoutRepository.save(workout);
    }

    // Update an existing workout — find it first, then overwrite the fields
    public Workout updateWorkout(Long id, Workout updated) {
        return workoutRepository.findById(id).map(w -> {
            w.setType(updated.getType());
            w.setDuration(updated.getDuration());
            w.setNotes(updated.getNotes());
            w.setDate(updated.getDate());
            return workoutRepository.save(w);
        }).orElseThrow(() -> new RuntimeException("Workout not found: " + id));
    }

    // Delete a workout by its ID
    public void deleteWorkout(Long id) {
        workoutRepository.deleteById(id);
    }
}
