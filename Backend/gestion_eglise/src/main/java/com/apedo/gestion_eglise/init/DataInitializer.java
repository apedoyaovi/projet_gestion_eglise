package com.apedo.gestion_eglise.init;

import com.apedo.gestion_eglise.entities.User;
import com.apedo.gestion_eglise.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Init or Update Admin User
        String email = "admin@eglisemanager.com";
        System.out.println("Checking for admin user with email: " + email);

        if (userRepository.findByEmail(email).isEmpty()) {
            System.out.println("Admin user not found, creating new one...");
            User admin = new User(email, "Administrateur", passwordEncoder.encode("admin123"), "ADMIN");
            userRepository.save(admin);
            System.out.println("Admin user created successfully.");
        } else {
            System.out.println("Admin user already exists, skipping initialization.");
        }
    }
}
