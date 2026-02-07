package com.sweatlogic.fitness.controller;

import com.sweatlogic.fitness.model.User;
import com.sweatlogic.fitness.model.Workout;
import com.sweatlogic.fitness.service.UserService;
import com.sweatlogic.fitness.service.WorkoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
public class WebController {

    @Autowired
    private UserService userService;

    @Autowired
    private WorkoutService workoutService;

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        Optional<User> user = userService.findByUsername(authentication.getName());
        if (user.isPresent()) {
            List<Workout> workouts = workoutService.getUserWorkouts(user.get());
            model.addAttribute("user", user.get());
            model.addAttribute("workouts", workouts);
            
            // Calculate statistics
            long totalWorkouts = workouts.size();
            long completedWorkouts = workouts.stream().filter(Workout::getCompleted).count();
            int totalCalories = workouts.stream()
                    .filter(Workout::getCompleted)
                    .mapToInt(w -> w.getCaloriesBurned() != null ? w.getCaloriesBurned() : 0)
                    .sum();
            
            model.addAttribute("totalWorkouts", totalWorkouts);
            model.addAttribute("completedWorkouts", completedWorkouts);
            model.addAttribute("totalCalories", totalCalories);
            
            return "dashboard";
        }
        return "redirect:/login";
    }
}
