package com.sweatlogic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a single workout entry in the database.
 * Each row in the "workouts" table maps to one Workout object.
 *
 * Think of this like a blueprint — it tells the database what
 * columns the workouts table should have and what type of data
 * each column stores.
 */
@Entity
@Table(name = "workouts")
public class Workout {

    // The database auto-generates a unique ID for each workout
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // What kind of workout: "running", "cycling", "weights", or "other"
    @Column(nullable = false)
    private String type;

    // How long the workout lasted, in minutes
    @Column(nullable = false)
    private int duration;

    // Optional notes the user can add, like "felt great today"
    @Column(columnDefinition = "TEXT")
    private String notes;

    // When the workout happened — stored as a full date + time
    @Column(nullable = false)
    private LocalDateTime date;

    // JPA needs this empty constructor to create Workout objects from database rows
    public Workout() {}

    // Handy constructor for when we want to create a workout in code (used by the seed data)
    public Workout(String type, int duration, String notes, LocalDateTime date) {
        this.type = type;
        this.duration = duration;
        this.notes = notes;
        this.date = date;
    }

    // --- Getters and Setters ---
    // These let other parts of the app read and update workout fields.
    // Spring uses these behind the scenes to convert between JSON and Java objects.

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
}
