package com.sweatlogic.model;

import jakarta.persistence.*;

/**
 * Represents a user in the database.
 * Each row in the "users" table maps to one User object.
 *
 * Right now we keep it simple — just a username and their
 * preferred unit system (imperial vs metric). We can add
 * more fields later (email, password, etc.) as needed.
 */
@Entity
@Table(name = "users")
public class User {

    // Auto-generated unique ID for each user
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each username must be unique — no two users can share the same name
    @Column(unique = true, nullable = false)
    private String username;

    // The user's preferred measurement system: "imperial" (miles, lbs) or "metric" (km, kg)
    @Column(nullable = false)
    private String unit;

    // JPA needs this empty constructor to create User objects from database rows
    public User() {}

    // Shortcut constructor used when creating users in code
    public User(String username, String unit) {
        this.username = username;
        this.unit = unit;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
