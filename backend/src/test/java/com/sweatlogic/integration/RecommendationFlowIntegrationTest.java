package com.sweatlogic.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecommendationFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void should_generate_recommendation_end_to_end_when_request_is_valid() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/recommendations/generate/core")
                        .param("goal", "cardio")
                        .param("level", "beginner")
                        .param("seed", "42")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bodyPart").value("core"))
                .andExpect(jsonPath("$.goal").value("cardio"))
                .andExpect(jsonPath("$.level").value("beginner"))
                .andExpect(jsonPath("$.exercises").isArray())
                .andExpect(jsonPath("$.exercises.length()").value(3))
                .andExpect(jsonPath("$.exercises[0].category").value("cardio"))
                .andExpect(jsonPath("$.exercises[0].name").value("Mountain Climber"))
                .andReturn();

        Map<String, Object> payload = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(),
                new TypeReference<>() {
                }
        );
        assertThat(payload.keySet()).containsExactlyInAnyOrder("bodyPart", "goal", "level", "exercises");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exercises = (List<Map<String, Object>>) payload.get("exercises");
        assertThat(exercises).allSatisfy(exercise ->
                assertThat(exercise.keySet()).contains("id", "name", "bodyPart", "category", "sets", "reps", "instructions"));
    }
}
