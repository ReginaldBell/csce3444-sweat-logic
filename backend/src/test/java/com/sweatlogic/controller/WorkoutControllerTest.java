package com.sweatlogic.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sweatlogic.model.Workout;
import com.sweatlogic.service.WorkoutService;
import com.sweatlogic.support.TestWorkoutBuilder;
import com.sweatlogic.support.WorkoutRequestBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WorkoutController.class)
class WorkoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WorkoutService workoutService;

    @Test
    void should_return_all_workouts_when_list_endpoint_is_requested() throws Exception {
        when(workoutService.getAllWorkouts()).thenReturn(List.of(
                TestWorkoutBuilder.workout().withId(1L).build(),
                TestWorkoutBuilder.workout().withId(2L).withType("running").withDuration(30).build()
        ));

        mockMvc.perform(get("/api/workouts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].type").value("weights"))
                .andExpect(jsonPath("$[0].duration").isNumber())
                .andExpect(jsonPath("$[0].notes").value("Chest and triceps"))
                .andExpect(jsonPath("$[0].date").isString());
    }

    @Test
    void should_return_saved_workout_contract_when_create_endpoint_is_called() throws Exception {
        Workout savedWorkout = TestWorkoutBuilder.workout().withId(99L).build();
        when(workoutService.saveWorkout(any(Workout.class))).thenReturn(savedWorkout);

        MvcResult result = mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(WorkoutRequestBuilder.request().toJson(objectMapper)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.type").value("weights"))
                .andExpect(jsonPath("$.duration").isNumber())
                .andExpect(jsonPath("$.notes").value("Chest and triceps"))
                .andExpect(jsonPath("$.date").isString())
                .andReturn();

        Map<String, Object> payload = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                }
        );
        assertThat(payload.keySet()).containsExactlyInAnyOrder("id", "type", "duration", "notes", "date");
        verify(workoutService).saveWorkout(any(Workout.class));
    }

    @Test
    void should_return_404_when_workout_is_not_found() throws Exception {
        when(workoutService.getWorkoutById(42L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/workouts/42"))
                .andExpect(status().isNotFound());
    }

    @Test
    void should_return_400_when_request_body_contains_malformed_json() throws Exception {
        mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"weights\","))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_400_when_request_body_is_empty() throws Exception {
        mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(""));
    }
}
