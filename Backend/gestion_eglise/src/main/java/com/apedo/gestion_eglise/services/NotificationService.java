package com.apedo.gestion_eglise.services;

import com.apedo.gestion_eglise.entities.Notification;
import com.apedo.gestion_eglise.entities.User;
import com.apedo.gestion_eglise.repositories.NotificationRepository;
import com.apedo.gestion_eglise.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(String title, String message, String type) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            boolean shouldNotify = false;
            switch (type) {
                case "MEMBER":
                    shouldNotify = Boolean.TRUE.equals(user.getNotifyNewMembers());
                    break;
                case "FINANCE":
                    shouldNotify = Boolean.TRUE.equals(user.getNotifyTransactions());
                    break;
                case "EVENT":
                    shouldNotify = Boolean.TRUE.equals(user.getNotifyEvents());
                    break;
            }

            if (shouldNotify) {
                Notification notification = new Notification(user, title, message, type);
                notificationRepository.save(notification);
            }
        }
    }

    public List<Notification> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndRead(user, false);
    }
}
