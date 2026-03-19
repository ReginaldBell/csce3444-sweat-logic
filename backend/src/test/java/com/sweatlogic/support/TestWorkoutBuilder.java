package com.sweatlogic.support;

import com.sweatlogic.model.Workout;

import java.time.LocalDateTime;

public final class TestWorkoutBuilder {

    private Long id = 1L;
    private String type = "weights";
    private int duration = 45;
    private String notes = "Chest and triceps";
    private LocalDateTime date = LocalDateTime.of(2026, 3, 18, 18, 30);

    private TestWorkoutBuilder() {
    }

    public static TestWorkoutBuilder workout() {
        return new TestWorkoutBuilder();
    }

    public TestWorkoutBuilder withId(Long id) {
        this.id = id;
        return this;
    }

    public TestWorkoutBuilder withType(String type) {
        this.type = type;
        return this;
    }

    public TestWorkoutBuilder withDuration(int duration) {
        this.duration = duration;
        return this;
    }

    public TestWorkoutBuilder withNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public TestWorkoutBuilder withDate(LocalDateTime date) {
        this.date = date;
        return this;
    }

    public Workout build() {
        Workout workout = new Workout(type, duration, notes, date);
        workout.setId(id);
        return workout;
    }
}
