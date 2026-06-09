package com.mellita.repository;

import com.mellita.entity.DemandeInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeInscriptionRepository extends JpaRepository<DemandeInscription, Long> {
    List<DemandeInscription> findByStatutOrderByCreatedAtDesc(DemandeInscription.StatutDemande statut);
    Optional<DemandeInscription> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByStatut(DemandeInscription.StatutDemande statut);
}
