package com.apedo.gestion_eglise.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "church_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChurchConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String churchName;
    private String address;
    private String phone;
    private String email;
}
