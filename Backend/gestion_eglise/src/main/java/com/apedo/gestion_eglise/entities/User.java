package com.apedo.gestion_eglise.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @NotBlank
    @Size(max = 120)
    private String password;

    private String role; // ADMIN, USER

    @Column(name = "notify_new_members")
    private Boolean notifyNewMembers = true;

    @Column(name = "notify_transactions")
    private Boolean notifyTransactions = true;

    @Column(name = "notify_events")
    private Boolean notifyEvents = true;

    public User(String email, String fullName, String password, String role) {
        this.email = email;
        this.fullName = fullName;
        this.password = password;
        this.role = role;
    }
}
