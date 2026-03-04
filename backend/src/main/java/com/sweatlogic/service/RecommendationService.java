package com.sweatlogic.service;

import com.sweatlogic.dto.WorkoutPlan;
import com.sweatlogic.model.BodyPart;
import com.sweatlogic.model.Exercise;
import com.sweatlogic.model.ExperienceLevel;
import com.sweatlogic.model.Goal;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Rule-based workout recommendation engine.
 *
 * Sits between RecommendationController and ExerciseService.
 * Never touches the database directly — all exercise data flows
 * through ExerciseService so the catalog layer stays reusable.
 *
 * Data flow:
 *   RecommendationController
 *       ↓  (BodyPart, Goal, ExperienceLevel, seed?)
 *   RecommendationService        ← you are here
 *       ↓
 *   ExerciseService
 *       ↓
 *   ExerciseRepository → SQLite
 *
 * Rules applied during generation
 * ────────────────────────────────
 * BodyPart
 *   Filters the exercise pool to the requested muscle group.
 *   Uses BodyPart.getValue() to get the lowercase DB-safe string.
 *
 * Goal
 *   STRENGTH / ENDURANCE → strength-category exercises preferred (default).
 *   CARDIO               → cardio-category exercises moved to the front
 *                          of the pool before selection. Falls back to
 *                          full pool if no cardio exercises exist for
 *                          the chosen body part.
 *
 * ExperienceLevel → exercise count:
 *   BEGINNER     → 3  (lower volume, less overwhelming)
 *   INTERMEDIATE → 4  (balanced session)
 *   ADVANCED     → 5  (higher volume)
 *
 * Seed (optional)
 *   When a seed is provided the shuffle uses new Random(seed), making
 *   the result fully reproducible. Useful for testing and debugging.
 *   When null, Collections.shuffle() uses a random seed for true variety.
 */
@Service
public class RecommendationService {

    private final ExerciseService exerciseService;

    public RecommendationService(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    /**
     * Generates a workout plan for the given inputs.
     *
     * @param bodyPart  target muscle group (compile-time safe via enum)
     * @param goal      training intent — shapes exercise category priority
     * @param level     experience level — determines exercise count
     * @param seed      optional shuffle seed for reproducible output;
     *                  pass null for random variety
     * @return          a WorkoutPlan DTO ready to send to the frontend
     */
    public WorkoutPlan generateWorkout(BodyPart bodyPart, Goal goal,
                                       ExperienceLevel level, Long seed) {

        // Step 1 — Pull every exercise that targets this body part
        List<Exercise> pool = new ArrayList<>(
            exerciseService.getByBodyPart(bodyPart.getValue())
        );

        // Step 2 — Apply goal-based prioritisation
        pool = applyGoalFilter(pool, goal);

        // Step 3 — Shuffle for variety, using a seeded Random if provided
        if (seed != null) {
            Collections.shuffle(pool, new Random(seed));
        } else {
            Collections.shuffle(pool);
        }

        // Step 4 — Select the right number of exercises for this level
        List<Exercise> selected = pool.stream()
                .limit(exerciseCountFor(level))
                .collect(Collectors.toList());

        return new WorkoutPlan(bodyPart, goal, level, selected);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Reorders the pool so exercises matching the requested goal category
     * come first. Falls back to the full pool if no matching exercises exist.
     *
     * CARDIO / ENDURANCE → prefer cardio-category exercises
     * STRENGTH           → prefer strength-category exercises (most exercises)
     */
    private List<Exercise> applyGoalFilter(List<Exercise> pool, Goal goal) {
        String preferredCategory = (goal == Goal.CARDIO || goal == Goal.ENDURANCE)
                ? "cardio"
                : "strength";

        List<Exercise> preferred = pool.stream()
                .filter(e -> e.getCategory().equalsIgnoreCase(preferredCategory))
                .collect(Collectors.toList());

        // If no exercises match the preferred category, use the full pool
        // so we never return an empty plan
        if (preferred.isEmpty()) {
            return pool;
        }

        // Preferred exercises lead — the shuffle step will randomise within
        // each bucket so there is still variety across calls
        List<Exercise> rest = pool.stream()
                .filter(e -> !e.getCategory().equalsIgnoreCase(preferredCategory))
                .collect(Collectors.toList());

        List<Exercise> ordered = new ArrayList<>(preferred);
        ordered.addAll(rest);
        return ordered;
    }

    /**
     * Maps ExperienceLevel to the number of exercises in the plan.
     */
    private int exerciseCountFor(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER     -> 3;
            case ADVANCED     -> 5;
            default           -> 4; // INTERMEDIATE
        };
    }
}
