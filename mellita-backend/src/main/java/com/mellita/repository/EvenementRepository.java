package com.mellita.repository;

import com.mellita.entity.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {
    List<Evenement> findByStatut(Evenement.StatutEvenement statut);
    List<Evenement> findByOrderByDateDebutDesc();
    @Query("SELECT e FROM Evenement e WHERE e.dateDebut >= CURRENT_TIMESTAMP ORDER BY e.dateDebut ASC")
    List<Evenement> findUpcomingEvents();
}
