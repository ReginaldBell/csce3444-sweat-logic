package com.sweatlogic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 *
 * The frontend runs on a different origin (e.g., file:// or localhost:5500)
 * than the backend (localhost:8080). By default, browsers block requests
 * across different origins for security reasons.
 *
 * This config tells Spring: "It's okay — let the frontend make requests
 * to our /api/ endpoints from any origin."
 *
 * In production, you'd want to restrict allowedOrigins to your actual
 * domain instead of "*".
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")                       // Apply to all API routes
                .allowedOrigins("*")                         // Allow requests from any origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Allow these HTTP methods
                .allowedHeaders("*");                        // Allow any headers
    }
}
