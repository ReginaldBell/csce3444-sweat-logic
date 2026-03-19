package com.sweatlogic.support;

import com.sweatlogic.model.Exercise;

public final class TestExerciseBuilder {

    private Long id = 1L;
    private String name = "Bench Press";
    private String bodyPart = "chest";
    private String category = "strength";
    private int sets = 3;
    private String reps = "8-12";
    private String instructions = "Lower with control and press back up.";

    private TestExerciseBuilder() {
    }

    public static TestExerciseBuilder exercise() {
        return new TestExerciseBuilder();
    }

    public static TestExerciseBuilder cardioExercise() {
        return exercise()
                .withName("Mountain Climber")
                .withBodyPart("core")
                .withCategory("cardio")
                .withReps("30 sec");
    }

    public static TestExerciseBuilder strengthExercise() {
        return exercise();
    }

    public TestExerciseBuilder withId(Long id) {
        this.id = id;
        return this;
    }

    public TestExerciseBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public TestExerciseBuilder withBodyPart(String bodyPart) {
        this.bodyPart = bodyPart;
        return this;
    }

    public TestExerciseBuilder withCategory(String category) {
        this.category = category;
        return this;
    }

    public TestExerciseBuilder withSets(int sets) {
        this.sets = sets;
        return this;
    }

    public TestExerciseBuilder withReps(String reps) {
        this.reps = reps;
        return this;
    }

    public TestExerciseBuilder withInstructions(String instructions) {
        this.instructions = instructions;
        return this;
    }

    public Exercise build() {
        Exercise exercise = new Exercise(name, bodyPart, category, sets, reps, instructions);
        exercise.setId(id);
        return exercise;
    }
}
