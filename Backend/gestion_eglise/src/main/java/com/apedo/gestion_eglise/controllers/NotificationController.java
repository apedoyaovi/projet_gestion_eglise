package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.Notification;
import com.apedo.gestion_eglise.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam String email) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(email));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam String email) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam String email) {
        return ResponseEntity.ok(notificationService.getUnreadCount(email));
    }
}
