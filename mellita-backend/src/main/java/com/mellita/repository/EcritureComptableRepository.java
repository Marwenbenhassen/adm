package com.mellita.repository;

import com.mellita.entity.EcritureComptable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EcritureComptableRepository extends JpaRepository<EcritureComptable, Long> {
    List<EcritureComptable> findByStatutOrderByCreatedAtDesc(EcritureComptable.StatutEcriture statut);
    List<EcritureComptable> findAllByOrderByDateEcritureDesc();
    List<EcritureComptable> findBySaisiParId(Long userId);

    @Query("SELECT COALESCE(SUM(e.montant), 0) FROM EcritureComptable e WHERE e.type = 'RECETTE' AND e.statut = 'VALIDEE'")
    Double sumRecettesValidees();

    @Query("SELECT COALESCE(SUM(e.montant), 0) FROM EcritureComptable e WHERE e.type = 'DEPENSE' AND e.statut = 'VALIDEE'")
    Double sumDepensesValidees();
}