package com.sweatlogic.service;

import com.sweatlogic.dto.WorkoutPlan;
import com.sweatlogic.model.BodyPart;
import com.sweatlogic.model.Exercise;
import com.sweatlogic.model.ExperienceLevel;
import com.sweatlogic.model.Goal;
import com.sweatlogic.support.TestExerciseBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private ExerciseService exerciseService;

    @InjectMocks
    private RecommendationService recommendationService;

    @Test
    void should_prioritize_cardio_when_goal_is_cardio() {
        when(exerciseService.getByBodyPart("core")).thenReturn(List.of(
                TestExerciseBuilder.strengthExercise().withId(1L).withName("Plank").withBodyPart("core").build(),
                TestExerciseBuilder.strengthExercise().withId(2L).withName("Crunch").withBodyPart("core").build(),
                TestExerciseBuilder.cardioExercise().withId(3L).build(),
                TestExerciseBuilder.strengthExercise().withId(4L).withName("Leg Raise").withBodyPart("core").build()
        ));

        WorkoutPlan plan = recommendationService.generateWorkout(BodyPart.CORE, Goal.CARDIO, ExperienceLevel.BEGINNER, 42L);

        assertThat(plan.getExercises()).hasSize(3);
        assertThat(plan.getExercises().get(0).getCategory()).isEqualTo("cardio");
        assertThat(plan.getExercises().get(0).getName()).isEqualTo("Mountain Climber");
    }

    @Test
    void should_prioritize_cardio_when_goal_is_endurance() {
        when(exerciseService.getByBodyPart("core")).thenReturn(List.of(
                TestExerciseBuilder.cardioExercise().withId(10L).build(),
                TestExerciseBuilder.strengthExercise().withId(11L).withName("Russian Twist").withBodyPart("core").build(),
                TestExerciseBuilder.strengthExercise().withId(12L).withName("Crunch").withBodyPart("core").build()
        ));

        WorkoutPlan plan = recommendationService.generateWorkout(BodyPart.CORE, Goal.ENDURANCE, ExperienceLevel.BEGINNER, 5L);

        assertThat(plan.getExercises()).hasSize(3);
        assertThat(plan.getExercises().get(0).getCategory()).isEqualTo("cardio");
    }

    @Test
    void should_return_same_order_when_seed_is_reused() {
        List<Exercise> pool = List.of(
                TestExerciseBuilder.cardioExercise().withId(20L).withName("Jump Rope").build(),
                TestExerciseBuilder.cardioExercise().withId(21L).withName("Mountain Climber").build(),
                TestExerciseBuilder.strengthExercise().withId(22L).withName("Plank").withBodyPart("core").build(),
                TestExerciseBuilder.strengthExercise().withId(23L).withName("Crunch").withBodyPart("core").build(),
                TestExerciseBuilder.strengthExercise().withId(24L).withName("Leg Raise").withBodyPart("core").build()
        );
        when(exerciseService.getByBodyPart("core")).thenReturn(pool);

        WorkoutPlan first = recommendationService.generateWorkout(BodyPart.CORE, Goal.CARDIO, ExperienceLevel.INTERMEDIATE, 99L);
        WorkoutPlan second = recommendationService.generateWorkout(BodyPart.CORE, Goal.CARDIO, ExperienceLevel.INTERMEDIATE, 99L);

        assertThat(first.getExercises())
                .extracting(Exercise::getName)
                .containsExactlyElementsOf(second.getExercises().stream().map(Exercise::getName).toList());
    }

    @Test
    void should_map_exercise_count_to_each_experience_level() {
        when(exerciseService.getByBodyPart("chest")).thenReturn(List.of(
                TestExerciseBuilder.strengthExercise().withId(30L).withName("Bench Press").build(),
                TestExerciseBuilder.strengthExercise().withId(31L).withName("Push-Up").build(),
                TestExerciseBuilder.strengthExercise().withId(32L).withName("Dip").build(),
                TestExerciseBuilder.strengthExercise().withId(33L).withName("Chest Fly").build(),
                TestExerciseBuilder.strengthExercise().withId(34L).withName("Incline Press").build(),
                TestExerciseBuilder.strengthExercise().withId(35L).withName("Cable Press").build()
        ));

        assertThat(recommendationService.generateWorkout(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.BEGINNER, 7L).getExercises())
                .hasSize(3);
        assertThat(recommendationService.generateWorkout(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.INTERMEDIATE, 7L).getExercises())
                .hasSize(4);
        assertThat(recommendationService.generateWorkout(BodyPart.CHEST, Goal.STRENGTH, ExperienceLevel.ADVANCED, 7L).getExercises())
                .hasSize(5);
    }

    @Test
    void should_fallback_to_full_pool_when_preferred_category_is_missing() {
        when(exerciseService.getByBodyPart("arms")).thenReturn(List.of(
                TestExerciseBuilder.strengthExercise().withId(40L).withName("Bicep Curl").withBodyPart("arms").build(),
                TestExerciseBuilder.strengthExercise().withId(41L).withName("Hammer Curl").withBodyPart("arms").build(),
                TestExerciseBuilder.strengthExercise().withId(42L).withName("Tricep Pushdown").withBodyPart("arms").build()
        ));

        WorkoutPlan plan = recommendationService.generateWorkout(BodyPart.ARMS, Goal.CARDIO, ExperienceLevel.BEGINNER, 12L);

        assertThat(plan.getExercises()).hasSize(3);
        assertThat(plan.getExercises()).extracting(Exercise::getName)
                .containsExactlyInAnyOrder("Bicep Curl", "Hammer Curl", "Tricep Pushdown");
    }

    @Test
    void should_return_empty_plan_when_exercise_pool_is_empty() {
        when(exerciseService.getByBodyPart("legs")).thenReturn(List.of());

        WorkoutPlan plan = recommendationService.generateWorkout(BodyPart.LEGS, Goal.STRENGTH, ExperienceLevel.BEGINNER, 3L);

        assertThat(plan.getExercises()).isEmpty();
    }
}
