package com.sweatlogic.model;

import jakarta.persistence.*;

/**
 * Canonical record for a single exercise in the SweatLogic library.
 *
 * Exercises are predefined, deterministic reference data — they are seeded
 * once and never modified at runtime. Think of this table as a read-only
 * catalog that the recommendation engine draws from.
 *
 * Fields:
 *   name        — human-readable exercise name, must be unique
 *   bodyPart    — targeted muscle group: "chest", "back", "legs", "arms", or "core"
 *   category    — movement type: "strength", "cardio", or "flexibility"
 *   sets        — recommended number of sets
 *   reps        — recommended rep range (stored as a string so we can express
 *                 ranges like "8-12" or time-based targets like "30 sec")
 *   instructions — step-by-step cue for performing the exercise correctly
 */
@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Exercise name — unique so there are no duplicate entries in the catalog
    @Column(unique = true, nullable = false)
    private String name;

    // One of: "chest", "back", "legs", "arms", "core"
    @Column(nullable = false)
    private String bodyPart;

    // One of: "strength", "cardio", "flexibility"
    @Column(nullable = false)
    private String category;

    // Recommended number of sets, e.g. 3
    @Column(nullable = false)
    private int sets;

    // Rep target or time target expressed as a string, e.g. "8-12" or "30 sec"
    @Column(nullable = false)
    private String reps;

    // Plain-language how-to cue stored as long text
    @Column(columnDefinition = "TEXT", nullable = false)
    private String instructions;

    // Required by JPA to reconstruct objects from database rows
    public Exercise() {}

    // Convenience constructor used by the seed initializer
    public Exercise(String name, String bodyPart, String category,
                    int sets, String reps, String instructions) {
        this.name         = name;
        this.bodyPart     = bodyPart;
        this.category     = category;
        this.sets         = sets;
        this.reps         = reps;
        this.instructions = instructions;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBodyPart() { return bodyPart; }
    public void setBodyPart(String bodyPart) { this.bodyPart = bodyPart; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getSets() { return sets; }
    public void setSets(int sets) { this.sets = sets; }

    public String getReps() { return reps; }
    public void setReps(String reps) { this.reps = reps; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}
