package com.apedo.gestion_eglise.repositories;

import com.apedo.gestion_eglise.entities.Transaction;
import com.apedo.gestion_eglise.entities.TransactionType;
import com.apedo.gestion_eglise.entities.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByOrderByDateDesc();

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.type = :type")
    Double sumAmountByType(TransactionType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.type = :type AND t.account = :account")
    Double sumAmountByTypeAndAccount(TransactionType type, AccountType account);

    @Query("SELECT MONTH(t.date) as month, YEAR(t.date) as year, SUM(t.amount) as total " +
            "FROM Transaction t " +
            "WHERE t.type = :type " +
            "GROUP BY YEAR(t.date), MONTH(t.date) " +
            "ORDER BY year DESC, month DESC")
    List<Object[]> sumAmountByMonth(TransactionType type);
}
