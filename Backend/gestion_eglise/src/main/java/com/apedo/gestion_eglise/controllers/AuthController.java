package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.payload.JwtResponse;
import com.apedo.gestion_eglise.payload.LoginRequest;
import com.apedo.gestion_eglise.repositories.UserRepository;
import com.apedo.gestion_eglise.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: '{}'", loginRequest.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();

            var user = userRepository.findByEmail(userDetails.getUsername()).get();
            Long userId = user.getId();
            String fullName = user.getFullName();

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userId,
                    userDetails.getUsername(),
                    fullName,
                    role));
        } catch (org.springframework.security.core.AuthenticationException e) {
            logger.error("Authentication failed for user: '{}' - Error: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(new java.util.HashMap<String, String>() {
                        {
                            put("message", "Identifiants invalides ou utilisateur non trouvé.");
                            put("error", e.getMessage());
                        }
                    });
        } catch (Exception e) {
            logger.error("Internal error during login for user: '{}'", loginRequest.getEmail(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new java.util.HashMap<String, String>() {
                        {
                            put("message", "Une erreur interne est survenue.");
                        }
                    });
        }
    }
}
