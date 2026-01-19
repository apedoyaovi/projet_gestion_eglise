package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.User;
import com.apedo.gestion_eglise.repositories.UserRepository;
import com.apedo.gestion_eglise.services.BackupService;
import com.apedo.gestion_eglise.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private BackupService backupService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestParam String email) {
        logger.info("Fetching user details for: '{}'", email);
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        logger.warn("User not found: '{}'", email);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData) {
        String currentEmail = profileData.get("currentEmail");
        String newEmail = profileData.get("email");
        String fullName = profileData.get("fullName");

        logger.info("Profile update request: currentEmail='{}', newEmail='{}', fullName='{}'",
                currentEmail, newEmail, fullName);

        Optional<User> userOpt = userRepository.findByEmail(currentEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(fullName);
            user.setEmail(newEmail);
            userRepository.save(user);

            logger.info("User details updated successfully in DB for: '{}'", newEmail);

            // If email changed, we need a new token
            String newToken = null;
            if (currentEmail != null && !currentEmail.equalsIgnoreCase(newEmail)) {
                newToken = jwtUtils.generateTokenFromUsername(newEmail);
                logger.info("Generated new token for updated email: '{}'", newEmail);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            if (newToken != null) {
                response.put("token", newToken);
            }

            return ResponseEntity.ok(response);
        }
        logger.warn("User '{}' not found for profile update", currentEmail);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        String email = passwordData.get("email");
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        logger.info("Password change attempt for user: '{}'", email);

        if (email == null || email.trim().isEmpty()) {
            logger.error("Password change failed: email is null or empty");
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "L'email est requis pour changer le mot de passe."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(currentPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                logger.info("Password successfully changed for user: '{}'", email);
                return ResponseEntity.ok(Map.of("message", "Mot de passe changé avec succès"));
            } else {
                logger.warn("Password change failed: current password incorrect for user: '{}'", email);
                return ResponseEntity.badRequest().body(Map.of("message", "Mot de passe actuel incorrect"));
            }
        }

        logger.warn("Password change failed: User '{}' not found in database", email);
        return ResponseEntity.status(404).body(Map.of("message", "Utilisateur non trouvé: " + email));
    }

    @PostMapping("/create-super-member")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSuperMember(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String fullName = userData.get("fullName");
        String password = userData.get("password");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cet email est déjà utilisé."));
        }

        User user = new User(email, fullName, passwordEncoder.encode(password), "SUPER_MEMBER");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Super Membre créé avec succès"));
    }

    @GetMapping("/super-members")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<User>> getSuperMembers() {
        return ResponseEntity.ok(userRepository.findByRole("SUPER_MEMBER"));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if ("ADMIN".equals(user.getRole())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Impossible de supprimer un administrateur."));
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export-data")
    public ResponseEntity<?> exportData() {
        logger.info("Data export requested");
        Map<String, Object> data = backupService.exportAllData();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=eglise_backup.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }
}
