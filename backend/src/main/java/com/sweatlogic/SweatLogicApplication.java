package com.sweatlogic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * This is the main entry point for our SweatLogic backend.
 * When you run this class, Spring Boot starts up the server,
 * connects to the SQLite database, and exposes our REST API
 * on http://localhost:8080.
 */
@SpringBootApplication
public class SweatLogicApplication {
    public static void main(String[] args) {
        SpringApplication.run(SweatLogicApplication.class, args);
    }
}
