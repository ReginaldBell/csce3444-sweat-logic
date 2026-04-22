package com.sweatlogic.support;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public final class WorkoutRequestBuilder {

    private String type = "weights";
    private int duration = 45;
    private String notes = "Generated workout";
    private LocalDateTime date = LocalDateTime.of(2026, 3, 18, 19, 15);

    private WorkoutRequestBuilder() {
    }

    public static WorkoutRequestBuilder request() {
        return new WorkoutRequestBuilder();
    }

    public WorkoutRequestBuilder withType(String type) {
        this.type = type;
        return this;
    }

    public WorkoutRequestBuilder withDuration(int duration) {
        this.duration = duration;
        return this;
    }

    public WorkoutRequestBuilder withNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public WorkoutRequestBuilder withDate(LocalDateTime date) {
        this.date = date;
        return this;
    }

    public String toJson(ObjectMapper objectMapper) throws JsonProcessingException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", type);
        payload.put("duration", duration);
        payload.put("notes", notes);
        payload.put("date", date);
        return objectMapper.writeValueAsString(payload);
    }
}
