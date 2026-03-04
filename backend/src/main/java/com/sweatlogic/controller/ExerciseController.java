package com.sweatlogic.controller;

import com.sweatlogic.model.Exercise;
import com.sweatlogic.service.ExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Read-only REST API for the exercise catalog.
 * All endpoints live under /api/exercises.
 *
 * These endpoints are consumed by the recommendation engine on the frontend
 * and by the workout view to display exercise details to the user.
 *
 * No POST / PUT / DELETE — the catalog is managed exclusively through
 * the seed initializer, not through user input.
 */
@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    // Return the entire exercise catalog
    @GetMapping
    public List<Exercise> getAllExercises() {
        return exerciseService.getAllExercises();
    }

    // Return a single exercise by ID — 404 if not found
    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable Long id) {
        return exerciseService.getExerciseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Filter catalog by body part — used by the body-part selection UI
    // Example: GET /api/exercises/by-body-part/chest
    @GetMapping("/by-body-part/{bodyPart}")
    public List<Exercise> getByBodyPart(@PathVariable String bodyPart) {
        return exerciseService.getByBodyPart(bodyPart);
    }

    // Filter catalog by category — used to separate strength vs cardio days
    // Example: GET /api/exercises/by-category/strength
    @GetMapping("/by-category/{category}")
    public List<Exercise> getByCategory(@PathVariable String category) {
        return exerciseService.getByCategory(category);
    }
}
