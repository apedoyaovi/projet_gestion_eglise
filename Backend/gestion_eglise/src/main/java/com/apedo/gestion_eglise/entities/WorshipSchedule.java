package com.apedo.gestion_eglise.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "worship_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorshipSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private String label;
}
