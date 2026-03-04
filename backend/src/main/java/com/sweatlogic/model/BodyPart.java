package com.sweatlogic.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * The five muscle groups supported by the exercise catalog.
 *
 * Used as a path variable in RecommendationController and passed
 * to ExerciseService.getByBodyPart() which queries the database.
 * getValue() returns the lowercase string that matches the stored
 * bodyPart column value in the exercises table.
 *
 * @JsonValue makes Jackson serialize this as a lowercase string
 * in API responses, e.g. CHEST → "chest".
 */
public enum BodyPart {
    CHEST,
    BACK,
    LEGS,
    ARMS,
    CORE;

    /**
     * Returns the lowercase database-safe value, e.g. CHEST → "chest".
     * Used when querying ExerciseRepository.findByBodyPart().
     * Also used by Jackson for serialization so responses read naturally.
     */
    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    /**
     * Case-insensitive factory used by the controller to convert
     * a raw path-variable string into a validated BodyPart value.
     * Throws IllegalArgumentException on unrecognised input so the
     * controller can return a 400 with a helpful message.
     */
    public static BodyPart fromString(String value) {
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid body part: '" + value + "'. Must be one of: chest, back, legs, arms, core"
            );
        }
    }
}
