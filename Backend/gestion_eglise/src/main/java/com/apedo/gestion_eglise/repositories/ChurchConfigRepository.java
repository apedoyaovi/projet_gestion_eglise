package com.apedo.gestion_eglise.repositories;

import com.apedo.gestion_eglise.entities.ChurchConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChurchConfigRepository extends JpaRepository<ChurchConfig, Long> {
}
