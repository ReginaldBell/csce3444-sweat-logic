package com.sweatlogic.controller;

import com.sweatlogic.dto.WorkoutPlan;
import com.sweatlogic.model.BodyPart;
import com.sweatlogic.model.ExperienceLevel;
import com.sweatlogic.model.Goal;
import com.sweatlogic.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for on-demand workout generation.
 * All endpoints live under /api/recommendations.
 *
 * All three input values are validated before they reach the service.
 * An unrecognised value returns a 400 Bad Request with a plain-text
 * message explaining exactly what went wrong and what values are valid.
 *
 * Endpoint:
 *   GET /api/recommendations/generate/{bodyPart}
 *       ?goal={strength|cardio|endurance}         (default: strength)
 *       &level={beginner|intermediate|advanced}   (default: intermediate)
 *       &seed={long}                              (optional — for repeatable results)
 *
 * Example requests:
 *   GET /api/recommendations/generate/chest
 *   GET /api/recommendations/generate/legs?goal=strength&level=beginner
 *   GET /api/recommendations/generate/core?goal=cardio&level=advanced
 *   GET /api/recommendations/generate/arms?seed=42          ← same result every time
 *
 * Example 200 response:
 *   {
 *     "bodyPart": "chest",
 *     "goal":     "strength",
 *     "level":    "intermediate",
 *     "exercises": [
 *       { "id": 1, "name": "Bench Press",           "sets": 3, "reps": "8-12",  ... },
 *       { "id": 3, "name": "Incline Dumbbell Press","sets": 3, "reps": "10-12", ... },
 *       { "id": 4, "name": "Chest Fly",             "sets": 3, "reps": "12-15", ... },
 *       { "id": 2, "name": "Push-Up",               "sets": 3, "reps": "12-15", ... }
 *     ]
 *   }
 *
 * Example 400 response (invalid goal):
 *   "Invalid goal: 'banana'. Must be one of: strength, cardio, endurance"
 */
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Generates a workout plan for the requested body part.
     *
     * Validation happens here before the service is ever called.
     * Each enum's fromString() method throws IllegalArgumentException
     * with a descriptive message on bad input — we catch that and
     * return a 400 so the frontend can surface a useful error.
     *
     * @param bodyPart  path variable  — chest | back | legs | arms | core
     * @param goal      query param    — strength (default) | cardio | endurance
     * @param level     query param    — intermediate (default) | beginner | advanced
     * @param seed      query param    — optional long; makes shuffle reproducible
     */
    @GetMapping("/generate/{bodyPart}")
    public ResponseEntity<?> generate(
            @PathVariable  String  bodyPart,
            @RequestParam(defaultValue = "strength")     String goal,
            @RequestParam(defaultValue = "intermediate") String level,
            @RequestParam(required = false)              Long   seed) {

        // Validate and convert each input — return 400 on first invalid value
        BodyPart        parsedBodyPart;
        Goal            parsedGoal;
        ExperienceLevel parsedLevel;

        try {
            parsedBodyPart = BodyPart.fromString(bodyPart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        try {
            parsedGoal = Goal.fromString(goal);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        try {
            parsedLevel = ExperienceLevel.fromString(level);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        // Validate body-part / goal compatibility
        boolean isGoalRestricted = (parsedGoal == Goal.CARDIO || parsedGoal == Goal.ENDURANCE);
        if (isGoalRestricted && parsedBodyPart != BodyPart.CORE) {
            return ResponseEntity.badRequest()
                    .body("Cardio and endurance plans are currently available for Core only.");
        }

        WorkoutPlan plan = recommendationService.generateWorkout(
                parsedBodyPart, parsedGoal, parsedLevel, seed);

        return ResponseEntity.ok(plan);
    }
}
