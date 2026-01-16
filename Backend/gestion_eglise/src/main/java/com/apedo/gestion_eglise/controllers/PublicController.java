package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.Event;
import com.apedo.gestion_eglise.entities.WorshipSchedule;
import com.apedo.gestion_eglise.entities.ChurchConfig;
import com.apedo.gestion_eglise.repositories.EventRepository;
import com.apedo.gestion_eglise.repositories.MemberRepository;
import com.apedo.gestion_eglise.repositories.ChurchConfigRepository;
import com.apedo.gestion_eglise.services.WorshipScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private WorshipScheduleService scheduleService;

    @Autowired
    private ChurchConfigRepository churchConfigRepository;

    @GetMapping("/stats")
    public Map<String, Object> getPublicStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", memberRepository.count());
        stats.put("totalEvents", eventRepository.count());
        return stats;
    }

    @GetMapping("/events/latest")
    public List<Event> getLatestEvents() {
        // Just return the last 3 events for the landing page
        return eventRepository.findAll().stream()
                .sorted((e1, e2) -> e2.getDate().compareTo(e1.getDate()))
                .limit(3)
                .collect(Collectors.toList());
    }

    @GetMapping("/schedules")
    public List<WorshipSchedule> getPublicSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/church-info")
    public ChurchConfig getChurchInfo() {
        return churchConfigRepository.findAll().stream().findFirst()
                .orElse(new ChurchConfig(null, "Temple Emmanuel", "Lomé, Togo", "+228 XX XX XX XX",
                        "contact@temple-emmanuel.org"));
    }

    @GetMapping("/events")
    public List<Event> getAllPublicEvents() {
        return eventRepository.findAll().stream()
                .sorted((e1, e2) -> e2.getDate().compareTo(e1.getDate()))
                .collect(Collectors.toList());
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<Event> getPublicEventById(@PathVariable Long id) {
        Optional<Event> event = eventRepository.findById(id);
        return event.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
