package com.apedo.gestion_eglise.repositories;

import com.apedo.gestion_eglise.entities.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    // Custom query methods can be added here if needed
}
