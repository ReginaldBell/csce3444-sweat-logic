package com.sweatlogic.controller;

import com.sweatlogic.model.Workout;
import com.sweatlogic.service.WorkoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for workouts.
 * This is the layer that the frontend talks to.
 * All endpoints live under /api/workouts.
 *
 * How the data flows:
 *   Frontend (JS fetch) → Controller → Service → Repository → SQLite Database
 *
 * The controller's only job is to receive HTTP requests,
 * hand them off to the service, and return the response.
 */
@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    // Fetch all workouts — the dashboard and progress page both use this
    @GetMapping
    public List<Workout> getAllWorkouts() {
        return workoutService.getAllWorkouts();
    }

    // Fetch a single workout by ID — returns 404 if it doesn't exist
    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(@PathVariable Long id) {
        return workoutService.getWorkoutById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new workout — the frontend sends JSON in the request body
    @PostMapping
    public ResponseEntity<Workout> createWorkout(@RequestBody Workout workout) {
        Workout saved = workoutService.saveWorkout(workout);
        return ResponseEntity.ok(saved);
    }

    // Update an existing workout — returns 404 if the ID doesn't match anything
    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(@PathVariable Long id, @RequestBody Workout workout) {
        try {
            return ResponseEntity.ok(workoutService.updateWorkout(id, workout));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a workout — returns 204 (no content) on success, 404 if not found
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id) {
        try {
            workoutService.deleteWorkout(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Export all workouts as a downloadable JSON file
    @GetMapping("/export")
    public ResponseEntity<List<Workout>> exportWorkouts() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=workouts.json");
        return ResponseEntity.ok()
                .headers(headers)
                .body(workoutService.getAllWorkouts());
    }

    // Import workouts from a JSON file — replaces all existing workouts
    @PostMapping("/import")
    public ResponseEntity<Void> importWorkouts(@RequestBody List<Workout> workouts) {
        workoutService.importWorkouts(workouts);
        return ResponseEntity.ok().build();
    }
}
