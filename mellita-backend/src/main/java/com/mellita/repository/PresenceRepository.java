package com.mellita.repository;

import com.mellita.entity.Presence;
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
public interface PresenceRepository extends JpaRepository<Presence, Long> {

    // ===== RECHERCHE DE BASE — avec FETCH pour éviter LazyInitializationException =====
    @Query("SELECT p FROM Presence p JOIN FETCH p.membre JOIN FETCH p.club WHERE p.club.id = :clubId")
    List<Presence> findByClubId(@Param("clubId") Long clubId);

    @Query("SELECT p FROM Presence p JOIN FETCH p.membre JOIN FETCH p.club WHERE p.membre.id = :membreId")
    List<Presence> findByMembreId(@Param("membreId") Long membreId);

    @Query("SELECT p FROM Presence p JOIN FETCH p.membre JOIN FETCH p.club WHERE p.club.id = :clubId AND p.dateSeance = :date")
    List<Presence> findByClubIdAndDateSeance(@Param("clubId") Long clubId, @Param("date") LocalDate date);

    @Query("SELECT p FROM Presence p JOIN FETCH p.membre WHERE p.club.id = :clubId AND p.membre.id = :membreId")
    Optional<Presence> findByClubIdAndMembreId(@Param("clubId") Long clubId, @Param("membreId") Long membreId);

    @Query("SELECT p FROM Presence p JOIN FETCH p.membre JOIN FETCH p.club WHERE p.club.id = :clubId ORDER BY p.dateSeance DESC")
    List<Presence> findByClubIdOrderByDateSeanceDesc(@Param("clubId") Long clubId);

    @Query("SELECT p FROM Presence p JOIN FETCH p.membre WHERE p.club.id = :clubId AND p.membre.id = :membreId AND p.dateSeance = :date")
    Optional<Presence> findByClubIdAndMembreIdAndDateSeance(
            @Param("clubId") Long clubId,
            @Param("membreId") Long membreId,
            @Param("date") LocalDate date);

    // ===== VÉRIFICATIONS =====
    boolean existsByClubIdAndDateSeance(Long clubId, LocalDate date);
    boolean existsByClubIdAndMembreIdAndDateSeance(Long clubId, Long membreId, LocalDate date);

    // ===== STATISTIQUES =====
    @Query("SELECT COUNT(p) FROM Presence p WHERE p.membre.id = :membreId AND p.club.id = :clubId AND p.present = true")
    Long countPresencesByMembreAndClub(@Param("membreId") Long membreId, @Param("clubId") Long clubId);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.club.id = :clubId AND p.present = true")
    Long countPresentByClubId(@Param("clubId") Long clubId);

    @Query("SELECT COUNT(DISTINCT p.dateSeance) FROM Presence p WHERE p.club.id = :clubId")
    Long countDistinctSeancesByClubId(@Param("clubId") Long clubId);

    @Query("SELECT SUM(p.fraisSeance) FROM Presence p WHERE p.club.id = :clubId AND p.present = true")
    Double sumFraisByClubId(@Param("clubId") Long clubId);

    // ===== PAR ANIMATEUR =====
    @Query("SELECT p FROM Presence p JOIN FETCH p.membre JOIN FETCH p.club WHERE p.club.animateur.id = :animateurId ORDER BY p.dateSeance DESC")
    List<Presence> findByAnimateurId(@Param("animateurId") Long animateurId);

    @Query("SELECT SUM(p.partAnimateurSeance) FROM Presence p WHERE p.animateur.id = :animateurId AND p.present = true")
    Double sumPartAnimateur(@Param("animateurId") Long animateurId);

    @Query("SELECT p FROM Presence p JOIN FETCH p.membre WHERE p.animateur.id = :animateurId AND p.dateSeance BETWEEN :startDate AND :endDate")
    List<Presence> findByAnimateurIdAndDateRange(
            @Param("animateurId") Long animateurId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // ===== VALIDATION =====
    @Modifying
    @Transactional
    @Query("UPDATE Presence p SET p.statut = 'VALIDE' WHERE p.club.id = :clubId AND p.dateSeance = :date")
    void validateAllByClubIdAndDate(@Param("clubId") Long clubId, @Param("date") LocalDate date);

    @Modifying
    @Transactional
    @Query("UPDATE Presence p SET p.statut = :statut WHERE p.id = :presenceId")
    void updateStatut(@Param("presenceId") Long presenceId, @Param("statut") String statut);

    // ===== RECHERCHE AVEC DATE =====
    @Query("SELECT p FROM Presence p JOIN FETCH p.membre WHERE p.club.id = :clubId AND p.dateSeance BETWEEN :startDate AND :endDate")
    List<Presence> findByClubIdAndDateRange(
            @Param("clubId") Long clubId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // ===== SUPPRESSION =====
    @Modifying
    @Transactional
    void deleteByClubIdAndDateSeance(Long clubId, LocalDate date);

    @Modifying
    @Transactional
    void deleteByClubId(Long clubId);
}