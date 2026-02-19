package com.sweatlogic.repository;

import com.sweatlogic.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * This is the data access layer for workouts.
 * It talks directly to the "workouts" table in our SQLite database.
 *
 * By extending JpaRepository, we get basic CRUD operations for free:
 *   - save(), findById(), findAll(), deleteById(), count(), etc.
 *
 * The custom methods below use Spring's naming convention — Spring
 * reads the method name and automatically writes the SQL query for us.
 * No manual SQL needed!
 */
@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    // Get all workouts, newest first (great for the dashboard)
    List<Workout> findAllByOrderByDateDesc();

    // Get workouts within a date range, newest first (useful for weekly/monthly views)
    List<Workout> findByDateBetweenOrderByDateDesc(LocalDateTime start, LocalDateTime end);

    // Get all workouts of a specific type, like "running" or "weights"
    List<Workout> findByType(String type);
}
