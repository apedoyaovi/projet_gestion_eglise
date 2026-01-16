package com.apedo.gestion_eglise.payload;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String role;

    public JwtResponse(String accessToken, Long id, String email, String fullName, String role) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}
