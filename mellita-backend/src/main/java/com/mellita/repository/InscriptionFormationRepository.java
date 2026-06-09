package com.mellita.repository;

import com.mellita.entity.InscriptionFormation;
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
public interface InscriptionFormationRepository extends JpaRepository<InscriptionFormation, Long> {

    List<InscriptionFormation> findByFormationId(Long formationId);

    List<InscriptionFormation> findByFormationIdOrderByDateInscriptionDesc(Long formationId);

    @Query("SELECT i FROM InscriptionFormation i LEFT JOIN FETCH i.membre WHERE i.formation.id = :formationId")
    List<InscriptionFormation> findByFormationIdWithMembre(@Param("formationId") Long formationId);

    List<InscriptionFormation> findByMembreId(Long membreId);

    List<InscriptionFormation> findByMembreIdOrderByDateInscriptionDesc(Long membreId);

    // ⭐ AJOUT UNIQUE : méthode avec FETCH JOIN pour la formation ⭐
    @Query("SELECT i FROM InscriptionFormation i LEFT JOIN FETCH i.formation WHERE i.membre.id = :membreId")
    List<InscriptionFormation> findByMembreIdWithFormation(@Param("membreId") Long membreId);

    Optional<InscriptionFormation> findByFormationIdAndMembreId(Long formationId, Long membreId);

    boolean existsByFormationIdAndMembreId(Long formationId, Long membreId);

    List<InscriptionFormation> findByStatutPaiement(String statutPaiement);

    List<InscriptionFormation> findByFormationIdAndStatutPaiement(Long formationId, String statutPaiement);

    List<InscriptionFormation> findByMembreIdAndStatutPaiement(Long membreId, String statutPaiement);

    List<InscriptionFormation> findByFormationIdAndCertificatDelivreTrue(Long formationId);

    List<InscriptionFormation> findByFormationIdAndCertificatDelivreFalse(Long formationId);

    long countByFormationId(Long formationId);

    long countByFormationIdAndStatutPaiement(Long formationId, String statutPaiement);

    long countByFormationIdAndCertificatDelivreTrue(Long formationId);

    @Query("SELECT COALESCE(SUM(i.montantPaye), 0) FROM InscriptionFormation i WHERE i.formation.id = :formationId AND i.statutPaiement = 'PAYE'")
    Double sumMontantPayeByFormationId(@Param("formationId") Long formationId);

    @Query("SELECT COALESCE(AVG(i.note), 0) FROM InscriptionFormation i WHERE i.formation.id = :formationId AND i.note IS NOT NULL")
    Double averageNoteByFormationId(@Param("formationId") Long formationId);

    @Modifying
    @Transactional
    @Query("UPDATE InscriptionFormation i SET i.statutPaiement = :statut, i.datePaiement = :datePaiement WHERE i.id = :id")
    void updateStatutPaiement(@Param("id") Long id,
                              @Param("statut") String statut,
                              @Param("datePaiement") LocalDate datePaiement);

    @Modifying
    @Transactional
    @Query("UPDATE InscriptionFormation i SET i.certificatDelivre = true WHERE i.formation.id = :formationId AND i.membre.id = :membreId")
    void delivrerCertificat(@Param("formationId") Long formationId, @Param("membreId") Long membreId);

    @Modifying
    @Transactional
    @Query("UPDATE InscriptionFormation i SET i.note = :note WHERE i.id = :id")
    void attribuerNote(@Param("id") Long id, @Param("note") Integer note);

    @Modifying
    @Transactional
    void deleteByFormationId(Long formationId);

    @Modifying
    @Transactional
    void deleteByMembreId(Long membreId);

    @Modifying
    @Transactional
    void deleteByFormationIdAndMembreId(Long formationId, Long membreId);

    boolean existsByMembreIdAndFormationId(Long membreId, Long formationId);

    boolean existsByFormationId(Long formationId);
}