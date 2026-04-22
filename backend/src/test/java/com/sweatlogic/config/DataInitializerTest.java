package com.sweatlogic.config;

import com.sweatlogic.model.Exercise;
import com.sweatlogic.model.User;
import com.sweatlogic.repository.ExerciseRepository;
import com.sweatlogic.repository.UserRepository;
import com.sweatlogic.repository.WorkoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private UserRepository userRepository;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(exerciseRepository, workoutRepository, userRepository);
        when(exerciseRepository.count()).thenReturn(25L);
    }

    @Test
    void should_short_circuit_demo_seeding_when_workouts_already_exist() throws Exception {
        when(exerciseRepository.existsByName(anyString())).thenReturn(true);
        when(workoutRepository.count()).thenReturn(4L);

        dataInitializer.run();

        verify(userRepository, never()).findByUsername(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(workoutRepository, never()).save(any());
        verify(exerciseRepository, never()).save(any(Exercise.class));
    }

    @Test
    void should_reuse_demo_user_when_it_already_exists_and_workouts_are_empty() throws Exception {
        when(exerciseRepository.existsByName(anyString())).thenReturn(true);
        when(workoutRepository.count()).thenReturn(0L);
        when(userRepository.findByUsername("demo_user")).thenReturn(Optional.of(new User("demo_user", "imperial")));

        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
        verify(workoutRepository, times(12)).save(any());
    }

    @Test
    void should_create_demo_user_when_it_is_missing_and_workouts_are_empty() throws Exception {
        when(exerciseRepository.existsByName(anyString())).thenReturn(true);
        when(workoutRepository.count()).thenReturn(0L);
        when(userRepository.findByUsername("demo_user")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        dataInitializer.run();

        verify(userRepository).save(any(User.class));
        verify(workoutRepository, times(12)).save(any());
    }

    @Test
    void should_skip_existing_exercise_names_when_catalog_entries_already_exist() throws Exception {
        when(exerciseRepository.existsByName(anyString())).thenAnswer(invocation ->
                "Bench Press".equals(invocation.getArgument(0, String.class)));
        when(workoutRepository.count()).thenReturn(1L);

        dataInitializer.run();

        ArgumentCaptor<Exercise> exerciseCaptor = ArgumentCaptor.forClass(Exercise.class);
        verify(exerciseRepository, times(49)).save(exerciseCaptor.capture());
        assertThat(exerciseCaptor.getAllValues())
                .extracting(Exercise::getName)
                .doesNotContain("Bench Press");
    }
}
