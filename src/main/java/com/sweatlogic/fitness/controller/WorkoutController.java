package com.sweatlogic.fitness.controller;

import com.sweatlogic.fitness.model.User;
import com.sweatlogic.fitness.model.Workout;
import com.sweatlogic.fitness.service.UserService;
import com.sweatlogic.fitness.service.WorkoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Workout>> getUserWorkouts(Authentication authentication) {
        Optional<User> user = userService.findByUsername(authentication.getName());
        if (user.isPresent()) {
            List<Workout> workouts = workoutService.getUserWorkouts(user.get());
            return ResponseEntity.ok(workouts);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateWorkout(@RequestBody Map<String, String> request, 
                                            Authentication authentication) {
        try {
            Optional<User> userOpt = userService.findByUsername(authentication.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String workoutType = request.get("type");
            if (workoutType == null || workoutType.isEmpty()) {
                workoutType = "Mixed";
            }

            Workout workout = workoutService.generateWorkout(userOpt.get(), workoutType);
            return ResponseEntity.ok(workout);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkout(@PathVariable Long id, Authentication authentication) {
        Optional<Workout> workout = workoutService.getWorkout(id);
        if (workout.isPresent() && 
            workout.get().getUser().getUsername().equals(authentication.getName())) {
            return ResponseEntity.ok(workout.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeWorkout(@PathVariable Long id, 
                                            @RequestBody Map<String, String> request,
                                            Authentication authentication) {
        try {
            Optional<Workout> workoutOpt = workoutService.getWorkout(id);
            if (workoutOpt.isEmpty() || 
                !workoutOpt.get().getUser().getUsername().equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            String notes = request.getOrDefault("notes", "");
            Workout completedWorkout = workoutService.completeWorkout(id, notes);
            return ResponseEntity.ok(completedWorkout);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkout(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<Workout> workoutOpt = workoutService.getWorkout(id);
            if (workoutOpt.isEmpty() || 
                !workoutOpt.get().getUser().getUsername().equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            workoutService.deleteWorkout(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Workout deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
