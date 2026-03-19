package com.sweatlogic.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sweatlogic.dto.WorkoutPlan;
import com.sweatlogic.model.BodyPart;
import com.sweatlogic.model.Exercise;
import com.sweatlogic.model.ExperienceLevel;
import com.sweatlogic.model.Goal;
import com.sweatlogic.service.RecommendationService;
import com.sweatlogic.support.TestExerciseBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecommendationController.class)
class RecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecommendationService recommendationService;

    @Test
    void should_return_recommendation_contract_when_request_is_valid() throws Exception {
        List<Exercise> exercises = List.of(
                TestExerciseBuilder.strengthExercise().withId(1L).withName("Bench Press").build(),
                TestExerciseBuilder.strengthExercise().withId(2L).withName("Push-Up").build(),
                TestExerciseBuilder.strengthExercise().withId(3L).withName("Dip").build()
        );
        WorkoutPlan plan = new WorkoutPlan(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.BEGINNER, exercises);
        when(recommendationService.generateWorkout(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.BEGINNER, 42L))
                .thenReturn(plan);

        MvcResult result = mockMvc.perform(get("/api/recommendations/generate/chest")
                        .param("goal", "strength")
                        .param("level", "beginner")
                        .param("seed", "42")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bodyPart").value("chest"))
                .andExpect(jsonPath("$.goal").value("strength"))
                .andExpect(jsonPath("$.level").value("beginner"))
                .andExpect(jsonPath("$.exercises").isArray())
                .andExpect(jsonPath("$.exercises[0].id").isNumber())
                .andExpect(jsonPath("$.exercises[0].name").value("Bench Press"))
                .andExpect(jsonPath("$.exercises[0].bodyPart").value("chest"))
                .andExpect(jsonPath("$.exercises[0].category").value("strength"))
                .andExpect(jsonPath("$.exercises[0].sets").isNumber())
                .andExpect(jsonPath("$.exercises[0].reps").isString())
                .andExpect(jsonPath("$.exercises[0].instructions").isString())
                .andReturn();

        Map<String, Object> payload = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                }
        );
        assertThat(payload.keySet()).containsExactlyInAnyOrder("bodyPart", "goal", "level", "exercises");
    }

    @Test
    void should_apply_default_goal_and_level_when_query_params_are_missing() throws Exception {
        WorkoutPlan plan = new WorkoutPlan(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.INTERMEDIATE, List.of());
        when(recommendationService.generateWorkout(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.INTERMEDIATE, null))
                .thenReturn(plan);

        mockMvc.perform(get("/api/recommendations/generate/chest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bodyPart").value("chest"))
                .andExpect(jsonPath("$.goal").value("strength"))
                .andExpect(jsonPath("$.level").value("intermediate"));

        verify(recommendationService).generateWorkout(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.INTERMEDIATE, null);
    }

    @Test
    void should_return_400_when_goal_is_invalid() throws Exception {
        mockMvc.perform(get("/api/recommendations/generate/chest").param("goal", "banana"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid goal: 'banana'. Must be one of: strength, cardio, endurance"));
    }

    @Test
    void should_return_400_when_level_is_invalid() throws Exception {
        mockMvc.perform(get("/api/recommendations/generate/chest").param("level", "expert"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid level: 'expert'. Must be one of: beginner, intermediate, advanced"));
    }

    @Test
    void should_return_400_when_body_part_is_invalid() throws Exception {
        mockMvc.perform(get("/api/recommendations/generate/shoulders"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid body part: 'shoulders'. Must be one of: chest, back, legs, arms, core"));
    }
}
