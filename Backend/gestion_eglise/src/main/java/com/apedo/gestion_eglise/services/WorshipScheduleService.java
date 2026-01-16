package com.apedo.gestion_eglise.services;

import com.apedo.gestion_eglise.entities.WorshipSchedule;
import com.apedo.gestion_eglise.repositories.WorshipScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorshipScheduleService {
    @Autowired
    private WorshipScheduleRepository repository;

    public List<WorshipSchedule> getAllSchedules() {
        return repository.findAll();
    }

    public Optional<WorshipSchedule> getScheduleById(Long id) {
        return repository.findById(id);
    }

    public WorshipSchedule saveSchedule(WorshipSchedule schedule) {
        return repository.save(schedule);
    }

    public void deleteSchedule(Long id) {
        repository.deleteById(id);
    }
}
