package com.apedo.gestion_eglise.services;

import com.apedo.gestion_eglise.entities.Transaction;
import com.apedo.gestion_eglise.entities.TransactionType;
import com.apedo.gestion_eglise.entities.AccountType;
import com.apedo.gestion_eglise.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc();
    }

    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Map<String, Object> getTreasuryStatistics() {
        Double totalIncome = transactionRepository.sumAmountByType(TransactionType.INCOME);
        Double totalExpense = transactionRepository.sumAmountByType(TransactionType.EXPENSE);

        totalIncome = totalIncome != null ? totalIncome : 0.0;
        totalExpense = totalExpense != null ? totalExpense : 0.0;

        Double incomeCaisse = transactionRepository.sumAmountByTypeAndAccount(TransactionType.INCOME,
                AccountType.CAISSE);
        Double expenseCaisse = transactionRepository.sumAmountByTypeAndAccount(TransactionType.EXPENSE,
                AccountType.CAISSE);
        incomeCaisse = incomeCaisse != null ? incomeCaisse : 0.0;
        expenseCaisse = expenseCaisse != null ? expenseCaisse : 0.0;

        Double incomeBanque = transactionRepository.sumAmountByTypeAndAccount(TransactionType.INCOME,
                AccountType.BANQUE);
        Double expenseBanque = transactionRepository.sumAmountByTypeAndAccount(TransactionType.EXPENSE,
                AccountType.BANQUE);
        incomeBanque = incomeBanque != null ? incomeBanque : 0.0;
        expenseBanque = expenseBanque != null ? expenseBanque : 0.0;

        // Calculate real balances from transactions only (income - expense)
        double currentCaisse = incomeCaisse - expenseCaisse;
        double currentBanque = incomeBanque - expenseBanque;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalIncome", totalIncome);
        stats.put("totalExpense", totalExpense);
        stats.put("soldeCaisseAnterieur", 0.0);
        stats.put("soldeBanqueAnterieur", 0.0);
        stats.put("currentCaisseBalance", currentCaisse);
        stats.put("currentBanqueBalance", currentBanque);
        stats.put("totalBalance", currentCaisse + currentBanque);

        return stats;
    }
}
