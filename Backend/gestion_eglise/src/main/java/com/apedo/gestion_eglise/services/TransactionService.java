package com.apedo.gestion_eglise.services;

import com.apedo.gestion_eglise.entities.Transaction;
import com.apedo.gestion_eglise.entities.TransactionType;
import com.apedo.gestion_eglise.entities.AccountType;
import com.apedo.gestion_eglise.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

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

    public List<Map<String, Object>> getMonthlyStats() {
        List<Object[]> incomeData = transactionRepository.sumAmountByMonth(TransactionType.INCOME);
        List<Object[]> expenseData = transactionRepository.sumAmountByMonth(TransactionType.EXPENSE);

        Map<String, Map<String, Object>> mergedData = new TreeMap<>(Collections.reverseOrder());

        // Process income
        for (Object[] row : incomeData) {
            if (row == null || row.length < 3)
                continue;
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            double amount = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            String key = String.format("%04d-%02d", year, month);

            Map<String, Object> monthData = mergedData.computeIfAbsent(key, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("month", month);
                m.put("year", year);
                m.put("income", 0.0);
                m.put("expense", 0.0);
                try {
                    m.put("name",
                            LocalDate.of(year, month, 1).getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH));
                } catch (Exception e) {
                    m.put("name", month + "/" + year);
                }
                return m;
            });
            monthData.put("income", amount);
        }

        // Process expenses
        for (Object[] row : expenseData) {
            if (row == null || row.length < 3)
                continue;
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            double amount = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            String key = String.format("%04d-%02d", year, month);

            Map<String, Object> monthData = mergedData.computeIfAbsent(key, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("month", month);
                m.put("year", year);
                m.put("income", 0.0);
                m.put("expense", 0.0);
                try {
                    m.put("name",
                            LocalDate.of(year, month, 1).getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH));
                } catch (Exception e) {
                    m.put("name", month + "/" + year);
                }
                return m;
            });
            monthData.put("expense", amount);
        }

        // Take the last 6 months (they are already sorted DESC by key)
        List<Map<String, Object>> result = new ArrayList<>(mergedData.values());
        if (result.size() > 6) {
            result = result.subList(0, 6);
        }

        // Reverse to have chronological order (ASC) for chart
        Collections.reverse(result);

        // If empty, add current month with 0 to avoid empty chart issues
        if (result.isEmpty()) {
            LocalDate now = LocalDate.now();
            Map<String, Object> m = new HashMap<>();
            m.put("month", now.getMonthValue());
            m.put("year", now.getYear());
            m.put("income", 0.0);
            m.put("expense", 0.0);
            m.put("name", now.getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH));
            result.add(m);
        }

        return result;
    }
}
