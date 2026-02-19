package com.sweatlogic.service;

import com.sweatlogic.model.User;
import com.sweatlogic.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Handles all user-related business logic.
 * Sits between the UserController and the UserRepository.
 *
 * For now this is straightforward CRUD, but as the app grows
 * we'd add things like password hashing or profile validation here.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    // Spring injects the repository automatically
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Look up a user by their database ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Look up a user by their username (e.g., "demo_user")
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Create a new user and save them to the database
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Update an existing user's info — find them first, then change their fields
    public User updateUser(Long id, User updated) {
        return userRepository.findById(id).map(u -> {
            u.setUsername(updated.getUsername());
            u.setUnit(updated.getUnit());
            return userRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
}
