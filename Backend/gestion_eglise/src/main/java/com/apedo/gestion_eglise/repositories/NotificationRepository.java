package com.apedo.gestion_eglise.repositories;

import com.apedo.gestion_eglise.entities.Notification;
import com.apedo.gestion_eglise.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndRead(User user, boolean read);
}
