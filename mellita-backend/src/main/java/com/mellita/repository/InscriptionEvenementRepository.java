package com.mellita.repository;

import com.mellita.entity.InscriptionEvenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionEvenementRepository extends JpaRepository<InscriptionEvenement, Long> {

    // ===== RECHERCHE PAR ÉVÉNEMENT =====
    List<InscriptionEvenement> findByEvenementId(Long evenementId);

    List<InscriptionEvenement> findByEvenementIdOrderByDateInscriptionDesc(Long evenementId);

    // ===== RECHERCHE PAR MEMBRE =====
    List<InscriptionEvenement> findByMembreId(Long membreId);

    List<InscriptionEvenement> findByMembreIdOrderByDateInscriptionDesc(Long membreId);

    // ===== RECHERCHE PAR ÉVÉNEMENT ET MEMBRE =====
    Optional<InscriptionEvenement> findByEvenementIdAndMembreId(Long evenementId, Long membreId);

    boolean existsByEvenementIdAndMembreId(Long evenementId, Long membreId);

    // ===== RECHERCHE PAR STATUT PAIEMENT =====
    List<InscriptionEvenement> findByStatutPaiement(String statutPaiement);

    List<InscriptionEvenement> findByEvenementIdAndStatutPaiement(Long evenementId, String statutPaiement);

    List<InscriptionEvenement> findByMembreIdAndStatutPaiement(Long membreId, String statutPaiement);

    // ===== RECHERCHE PAR PRÉSENCE =====
    List<InscriptionEvenement> findByEvenementIdAndPresenceTrue(Long evenementId);

    List<InscriptionEvenement> findByEvenementIdAndPresenceFalse(Long evenementId);

    // ===== STATISTIQUES =====
    long countByEvenementId(Long evenementId);

    long countByEvenementIdAndStatutPaiement(Long evenementId, String statutPaiement);

    long countByEvenementIdAndPresenceTrue(Long evenementId);

    @Query("SELECT COALESCE(SUM(i.montantPaye), 0) FROM InscriptionEvenement i WHERE i.evenement.id = :evenementId AND i.statutPaiement = 'PAYE'")
    Double sumMontantPayeByEvenementId(@Param("evenementId") Long evenementId);

    // ===== MISE À JOUR BULK =====
    @Modifying
    @Transactional
    @Query("UPDATE InscriptionEvenement i SET i.statutPaiement = :statut, i.datePaiement = :datePaiement WHERE i.id = :id")
    void updateStatutPaiement(@Param("id") Long id,
                              @Param("statut") String statut,
                              @Param("datePaiement") LocalDate datePaiement);

    @Modifying
    @Transactional
    @Query("UPDATE InscriptionEvenement i SET i.presence = true WHERE i.evenement.id = :evenementId AND i.membre.id = :membreId")
    void confirmerPresence(@Param("evenementId") Long evenementId, @Param("membreId") Long membreId);

    // ===== SUPPRESSION =====
    @Modifying
    @Transactional
    void deleteByEvenementId(Long evenementId);

    @Modifying
    @Transactional
    void deleteByMembreId(Long membreId);

    @Modifying
    @Transactional
    void deleteByEvenementIdAndMembreId(Long evenementId, Long membreId);

    // ===== VÉRIFICATION =====
    boolean existsByMembreIdAndEvenementId(Long membreId, Long evenementId);
}