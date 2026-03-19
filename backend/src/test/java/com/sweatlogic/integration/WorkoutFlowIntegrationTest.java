package com.sweatlogic.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sweatlogic.model.Workout;
import com.sweatlogic.repository.WorkoutRepository;
import com.sweatlogic.support.WorkoutRequestBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkoutFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Test
    void should_create_and_fetch_workout_end_to_end_when_request_is_valid() throws Exception {
        long initialCount = workoutRepository.count();

        MvcResult createResult = mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(WorkoutRequestBuilder.request()
                                .withType("cycling")
                                .withDuration(35)
                                .withNotes("Integration test ride")
                                .withDate(LocalDateTime.of(2026, 3, 18, 20, 5))
                                .toJson(objectMapper)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.type").value("cycling"))
                .andExpect(jsonPath("$.duration").value(35))
                .andExpect(jsonPath("$.notes").value("Integration test ride"))
                .andExpect(jsonPath("$.date").value("2026-03-18T20:05:00"))
                .andReturn();

        Map<String, Object> createdPayload = objectMapper.readValue(
                createResult.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                }
        );
        assertThat(createdPayload.keySet()).containsExactlyInAnyOrder("id", "type", "duration", "notes", "date");

        Long createdId = Long.valueOf(String.valueOf(createdPayload.get("id")));
        assertThat(workoutRepository.count()).isEqualTo(initialCount + 1);

        Workout persisted = workoutRepository.findById(createdId).orElseThrow();
        assertThat(persisted.getType()).isEqualTo("cycling");
        assertThat(persisted.getDuration()).isEqualTo(35);
        assertThat(persisted.getNotes()).isEqualTo("Integration test ride");
        assertThat(persisted.getDate()).isEqualTo(LocalDateTime.of(2026, 3, 18, 20, 5));

        mockMvc.perform(get("/api/workouts/{id}", createdId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdId))
                .andExpect(jsonPath("$.type").value("cycling"))
                .andExpect(jsonPath("$.duration").value(35))
                .andExpect(jsonPath("$.notes").value("Integration test ride"))
                .andExpect(jsonPath("$.date").value("2026-03-18T20:05:00"));
    }
}
