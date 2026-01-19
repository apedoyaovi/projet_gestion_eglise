package com.apedo.gestion_eglise.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String matricule;

    @Email
    private String email;

    private String phoneNumber;

    private String address;

    private LocalDate birthDate;

    private String gender;

    private String profession;

    private String maritalStatus;

    private LocalDate marriageDate;

    private String marriagePlace;

    private LocalDate arrivalDate;

    private LocalDate baptismDate;

    private String baptismLocation;

    private LocalDate departureDate;

    private String departureReason;

    private String memberGroup; // Renamed from group to avoid SQL issues

    private String status; // 'Actif', 'Inactif', 'Nouveau'
    private String addedBy;

    // Add other fields as needed based on frontend
}
