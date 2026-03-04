package com.sweatlogic.repository;

import com.sweatlogic.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for the exercise catalog.
 *
 * JpaRepository gives us findById(), findAll(), count(), etc. for free.
 * The two custom methods below let the recommendation engine filter
 * exercises by body part or category without any manual SQL.
 */
@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    // All exercises targeting a given muscle group, e.g. "chest" or "legs"
    List<Exercise> findByBodyPart(String bodyPart);

    // All exercises of a given movement type, e.g. "strength" or "cardio"
    List<Exercise> findByCategory(String category);

    // Whether a named exercise already exists — used by the seeder to stay idempotent
    boolean existsByName(String name);
}
