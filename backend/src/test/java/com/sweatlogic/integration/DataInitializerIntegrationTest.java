package com.sweatlogic.integration;

import com.sweatlogic.repository.ExerciseRepository;
import com.sweatlogic.repository.UserRepository;
import com.sweatlogic.repository.WorkoutRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DataInitializerIntegrationTest {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void should_seed_reference_and_demo_data_when_application_starts_with_empty_database() {
        assertThat(exerciseRepository.count()).isGreaterThanOrEqualTo(25);
        assertThat(workoutRepository.count()).isGreaterThanOrEqualTo(12);
        assertThat(userRepository.findByUsername("demo_user")).isPresent();
    }
}
