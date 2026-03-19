package com.sweatlogic.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents the user's self-reported experience level.
 *
 * Controls how many exercises RecommendationService selects
 * for the generated workout:
 *
 *   BEGINNER     → 3 exercises (lower volume, less overwhelming)
 *   INTERMEDIATE → 4 exercises (balanced session)
 *   ADVANCED     → 5 exercises (higher volume)
 *
 * @JsonValue makes Jackson serialize this as a lowercase string
 * in API responses, e.g. BEGINNER → "beginner".
 */
public enum ExperienceLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED;

    /**
     * Serializes to lowercase so API responses read naturally:
     * { "level": "beginner" } instead of { "level": "BEGINNER" }
     */
    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    /**
     * Case-insensitive factory used by the controller to convert
     * raw query-param strings into a validated ExperienceLevel value.
     * Throws IllegalArgumentException on unrecognised input so the
     * controller can return a 400 with a helpful message.
     */
    public static ExperienceLevel fromString(String value) {
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid level: '" + value + "'. Must be one of: beginner, intermediate, advanced"
            );
        }
    }
}
