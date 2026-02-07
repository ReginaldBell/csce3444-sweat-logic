package com.sweatlogic.fitness.service;

import com.sweatlogic.fitness.model.User;
import com.sweatlogic.fitness.model.Workout;
import com.sweatlogic.fitness.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class WorkoutService {

    @Autowired
    private WorkoutRepository workoutRepository;

    // Rule-based workout generation
    public Workout generateWorkout(User user, String workoutType) {
        Workout workout = new Workout();
        workout.setUser(user);
        workout.setType(workoutType);
        workout.setDifficulty(user.getFitnessLevel());
        workout.setCompleted(false);

        // Generate exercises based on rules
        String exercises = generateExercises(user.getFitnessLevel(), workoutType);
        workout.setExercises(exercises);

        // Set duration based on fitness level
        int duration = calculateDuration(user.getFitnessLevel(), workoutType);
        workout.setDuration(duration);

        // Estimate calories based on duration and type
        int calories = estimateCalories(duration, workoutType, user.getWeight());
        workout.setCaloriesBurned(calories);

        return workoutRepository.save(workout);
    }

    private String generateExercises(String fitnessLevel, String workoutType) {
        Map<String, Map<String, List<String>>> exerciseDatabase = new HashMap<>();
        
        // Cardio exercises
        Map<String, List<String>> cardioExercises = new HashMap<>();
        cardioExercises.put("Beginner", Arrays.asList("Walking - 10 min", "Light Jogging - 5 min", "Cycling - 10 min"));
        cardioExercises.put("Intermediate", Arrays.asList("Running - 15 min", "Cycling - 20 min", "Jump Rope - 10 min", "Burpees - 3 sets of 10"));
        cardioExercises.put("Advanced", Arrays.asList("Sprint Intervals - 20 min", "HIIT Training - 25 min", "Running - 30 min", "Advanced Burpees - 5 sets of 15"));
        exerciseDatabase.put("Cardio", cardioExercises);

        // Strength exercises
        Map<String, List<String>> strengthExercises = new HashMap<>();
        strengthExercises.put("Beginner", Arrays.asList("Push-ups - 2 sets of 10", "Bodyweight Squats - 2 sets of 15", "Planks - 2 sets of 30s"));
        strengthExercises.put("Intermediate", Arrays.asList("Push-ups - 3 sets of 15", "Squats - 3 sets of 20", "Lunges - 3 sets of 12", "Pull-ups - 3 sets of 8", "Planks - 3 sets of 60s"));
        strengthExercises.put("Advanced", Arrays.asList("Push-ups - 4 sets of 25", "Weighted Squats - 4 sets of 15", "Pull-ups - 4 sets of 12", "Deadlifts - 4 sets of 10", "Planks - 4 sets of 90s"));
        exerciseDatabase.put("Strength", strengthExercises);

        // Flexibility exercises
        Map<String, List<String>> flexibilityExercises = new HashMap<>();
        flexibilityExercises.put("Beginner", Arrays.asList("Hamstring Stretch - 3 sets of 30s", "Shoulder Stretch - 3 sets of 30s", "Cat-Cow Stretch - 10 reps"));
        flexibilityExercises.put("Intermediate", Arrays.asList("Yoga Flow - 15 min", "Deep Stretching - 20 min", "Hip Flexor Stretch - 3 sets of 45s"));
        flexibilityExercises.put("Advanced", Arrays.asList("Advanced Yoga - 30 min", "Split Training - 20 min", "Full Body Mobility - 25 min"));
        exerciseDatabase.put("Flexibility", flexibilityExercises);

        // Mixed exercises
        Map<String, List<String>> mixedExercises = new HashMap<>();
        mixedExercises.put("Beginner", Arrays.asList("Walking - 5 min", "Push-ups - 2 sets of 5", "Stretching - 10 min"));
        mixedExercises.put("Intermediate", Arrays.asList("Running - 10 min", "Push-ups - 3 sets of 12", "Squats - 3 sets of 15", "Yoga - 10 min"));
        mixedExercises.put("Advanced", Arrays.asList("HIIT - 15 min", "Strength Circuit - 20 min", "Advanced Stretching - 10 min"));
        exerciseDatabase.put("Mixed", mixedExercises);

        List<String> exercises = exerciseDatabase.getOrDefault(workoutType, new HashMap<>())
                .getOrDefault(fitnessLevel, Arrays.asList("Basic Workout"));

        return String.join(", ", exercises);
    }

    private int calculateDuration(String fitnessLevel, String workoutType) {
        Map<String, Integer> durationMap = new HashMap<>();
        durationMap.put("Beginner", 30);
        durationMap.put("Intermediate", 45);
        durationMap.put("Advanced", 60);
        return durationMap.getOrDefault(fitnessLevel, 30);
    }

    private int estimateCalories(int duration, String workoutType, Double weight) {
        if (weight == null) weight = 70.0; // Default weight
        
        double caloriesPerMinute;
        switch (workoutType) {
            case "Cardio":
                caloriesPerMinute = 10.0;
                break;
            case "Strength":
                caloriesPerMinute = 6.0;
                break;
            case "Flexibility":
                caloriesPerMinute = 3.0;
                break;
            case "Mixed":
                caloriesPerMinute = 7.0;
                break;
            default:
                caloriesPerMinute = 5.0;
        }
        
        return (int) (duration * caloriesPerMinute * (weight / 70.0));
    }

    public List<Workout> getUserWorkouts(User user) {
        return workoutRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Workout> getUserCompletedWorkouts(User user) {
        return workoutRepository.findByUserAndCompletedOrderByCreatedAtDesc(user, true);
    }

    public Workout completeWorkout(Long workoutId, String notes) {
        Optional<Workout> workoutOpt = workoutRepository.findById(workoutId);
        if (workoutOpt.isPresent()) {
            Workout workout = workoutOpt.get();
            workout.setCompleted(true);
            workout.setCompletedAt(LocalDateTime.now());
            workout.setNotes(notes);
            return workoutRepository.save(workout);
        }
        throw new RuntimeException("Workout not found");
    }

    public Optional<Workout> getWorkout(Long id) {
        return workoutRepository.findById(id);
    }

    public void deleteWorkout(Long id) {
        workoutRepository.deleteById(id);
    }
}
