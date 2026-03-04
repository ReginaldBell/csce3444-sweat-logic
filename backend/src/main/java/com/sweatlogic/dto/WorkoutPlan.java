package com.sweatlogic.dto;

import com.sweatlogic.model.BodyPart;
import com.sweatlogic.model.Exercise;
import com.sweatlogic.model.ExperienceLevel;
import com.sweatlogic.model.Goal;

import java.util.List;

/**
 * Data Transfer Object returned by the recommendation engine.
 *
 * WorkoutPlan is NOT a database entity — it is assembled on the fly
 * by RecommendationService and sent directly to the frontend as JSON.
 * Nothing here is persisted until the user chooses to log the session.
 *
 * Enum fields serialize to lowercase strings via @JsonValue on each enum,
 * so the JSON response reads: "bodyPart": "chest", "goal": "strength", etc.
 *
 * Fields:
 *   bodyPart  — the muscle group this plan targets
 *   goal      — the training goal that shaped exercise selection
 *   level     — the experience level that determined exercise count
 *   exercises — the ordered list of Exercise catalog records to perform
 */
public class WorkoutPlan {

    private BodyPart        bodyPart;
    private Goal            goal;
    private ExperienceLevel level;
    private List<Exercise>  exercises;

    // Required by Jackson for JSON serialization
    public WorkoutPlan() {}

    public WorkoutPlan(BodyPart bodyPart, Goal goal, ExperienceLevel level,
                       List<Exercise> exercises) {
        this.bodyPart  = bodyPart;
        this.goal      = goal;
        this.level     = level;
        this.exercises = exercises;
    }

    // --- Getters and Setters ---

    public BodyPart getBodyPart() { return bodyPart; }
    public void setBodyPart(BodyPart bodyPart) { this.bodyPart = bodyPart; }

    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }

    public ExperienceLevel getLevel() { return level; }
    public void setLevel(ExperienceLevel level) { this.level = level; }

    public List<Exercise> getExercises() { return exercises; }
    public void setExercises(List<Exercise> exercises) { this.exercises = exercises; }
}
