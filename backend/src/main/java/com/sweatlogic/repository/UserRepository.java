package com.sweatlogic.repository;

import com.sweatlogic.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data access layer for users.
 * Handles all reads and writes to the "users" table.
 *
 * JpaRepository gives us save(), findById(), findAll(), delete(), etc.
 * We just add one custom method to look up users by their username.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Look up a user by their username — returns Optional because the user might not exist
    Optional<User> findByUsername(String username);
}
