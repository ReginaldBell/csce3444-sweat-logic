package com.sweatlogic.service;

import com.sweatlogic.model.Exercise;
import com.sweatlogic.repository.ExerciseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Read-only service for the exercise catalog.
 *
 * Because exercises are deterministic reference data (seeded once, never
 * mutated at runtime), this service intentionally exposes only query
 * methods — no create, update, or delete.
 */
@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    // Return the full exercise catalog, ordered by the database default (insertion order)
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    // Look up one exercise by its ID — used when displaying exercise detail
    public Optional<Exercise> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    // Return all exercises that target a specific body part, e.g. "chest"
    // The recommendation engine calls this to build a workout for a given target
    public List<Exercise> getByBodyPart(String bodyPart) {
        return exerciseRepository.findByBodyPart(bodyPart.toLowerCase());
    }

    // Return all exercises of a given category, e.g. "cardio" or "strength"
    public List<Exercise> getByCategory(String category) {
        return exerciseRepository.findByCategory(category.toLowerCase());
    }
}
