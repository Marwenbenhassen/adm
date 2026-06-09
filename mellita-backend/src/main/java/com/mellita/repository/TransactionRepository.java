package com.mellita.repository;

import com.mellita.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByType(Transaction.TypeTransaction type);

    List<Transaction> findByMembreId(Long membreId);

    // ✅ Filtre par catégorie (String libre)
    List<Transaction> findByCategorie(String categorie);

    List<Transaction> findByTypeAndCategorie(Transaction.TypeTransaction type, String categorie);

    @Query("SELECT SUM(t.montant) FROM Transaction t WHERE t.type = 'RECETTE'")
    Double sumRecettes();

    @Query("SELECT SUM(t.montant) FROM Transaction t WHERE t.type = 'DEPENSE'")
    Double sumDepenses();

    @Query("SELECT t FROM Transaction t ORDER BY t.dateTransaction DESC")
    List<Transaction> findAllOrderByDateDesc();
}