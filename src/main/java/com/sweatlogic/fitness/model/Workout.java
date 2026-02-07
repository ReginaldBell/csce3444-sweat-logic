package com.sweatlogic.fitness.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "workouts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // Cardio, Strength, Flexibility, Mixed

    @Column(nullable = false)
    private String difficulty; // Beginner, Intermediate, Advanced

    @Column(nullable = false, length = 2000)
    private String exercises; // JSON string or comma-separated list of exercises

    private Integer duration; // in minutes

    private Integer caloriesBurned;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private Boolean completed = false;

    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
