package com.sweatlogic.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents the user's primary training goal.
 *
 * Used by RecommendationService to bias exercise selection
 * toward a particular category of movement:
 *
 *   STRENGTH  → prioritises strength-category exercises (default)
 *   CARDIO    → prioritises cardio-category exercises
 *   ENDURANCE → treated as cardio-adjacent; prioritises sustained
 *               effort exercises (maps to cardio category for now)
 *
 * @JsonValue makes Jackson serialize this as a lowercase string
 * in API responses, e.g. STRENGTH → "strength".
 */
public enum Goal {
    STRENGTH,
    CARDIO,
    ENDURANCE;

    /**
     * Serializes to lowercase so API responses read naturally:
     * { "goal": "strength" } instead of { "goal": "STRENGTH" }
     */
    @JsonValue
    public String getValue() {
        return name().toLowerCase();
    }

    /**
     * Case-insensitive factory used by the controller to convert
     * raw query-param strings into a validated Goal value.
     * Throws IllegalArgumentException on unrecognised input so the
     * controller can return a 400 with a helpful message.
     */
    public static Goal fromString(String value) {
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid goal: '" + value + "'. Must be one of: strength, cardio, endurance"
            );
        }
    }
}
