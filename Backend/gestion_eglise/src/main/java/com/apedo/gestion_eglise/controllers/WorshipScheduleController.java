package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.WorshipSchedule;
import com.apedo.gestion_eglise.services.WorshipScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class WorshipScheduleController {
    @Autowired
    private WorshipScheduleService service;

    @GetMapping
    public List<WorshipSchedule> getAllSchedules() {
        return service.getAllSchedules();
    }

    @PostMapping
    public WorshipSchedule createSchedule(@RequestBody WorshipSchedule schedule) {
        return service.saveSchedule(schedule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        service.deleteSchedule(id);
        return ResponseEntity.ok().build();
    }
}
