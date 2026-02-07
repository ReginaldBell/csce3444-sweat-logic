package com.sweatlogic.fitness.repository;

import com.sweatlogic.fitness.model.Workout;
import com.sweatlogic.fitness.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUserOrderByCreatedAtDesc(User user);
    List<Workout> findByUserAndCompletedOrderByCreatedAtDesc(User user, Boolean completed);
}
