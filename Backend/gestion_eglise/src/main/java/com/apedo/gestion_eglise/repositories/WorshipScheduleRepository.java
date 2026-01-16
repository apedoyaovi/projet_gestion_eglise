package com.apedo.gestion_eglise.repositories;

import com.apedo.gestion_eglise.entities.WorshipSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorshipScheduleRepository extends JpaRepository<WorshipSchedule, Long> {
}
