package com.apedo.gestion_eglise.services;

import com.apedo.gestion_eglise.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class BackupService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ChurchConfigRepository churchConfigRepository;

    @Autowired
    private WorshipScheduleRepository worshipScheduleRepository;

    public Map<String, Object> exportAllData() {
        Map<String, Object> backupData = new HashMap<>();

        backupData.put("members", memberRepository.findAll());
        backupData.put("transactions", transactionRepository.findAll());
        backupData.put("events", eventRepository.findAll());
        backupData.put("churchConfig", churchConfigRepository.findAll());
        backupData.put("worshipSchedules", worshipScheduleRepository.findAll());
        backupData.put("exportDate", new java.util.Date().toString());
        backupData.put("version", "1.0");

        return backupData;
    }
}
