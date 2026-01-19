package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.Transaction;
import com.apedo.gestion_eglise.services.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        String currentUser = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        transaction.setAddedBy(currentUser);
        return transactionService.saveTransaction(transaction);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return transactionService.getTreasuryStatistics();
    }

    @GetMapping("/monthly-stats")
    public List<Map<String, Object>> getMonthlyStats() {
        return transactionService.getMonthlyStats();
    }
}
