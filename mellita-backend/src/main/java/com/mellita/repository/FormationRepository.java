package com.mellita.repository;

import com.mellita.entity.Formation;
import com.mellita.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {

    // ==================== MÉTHODES DE BASE AVEC FETCH ====================

    @Query("SELECT f FROM Formation f LEFT JOIN FETCH f.createdBy LEFT JOIN FETCH f.formateurUser")
    List<Formation> findAll();

    @Query("SELECT f FROM Formation f LEFT JOIN FETCH f.createdBy LEFT JOIN FETCH f.formateurUser WHERE f.id = :id")
    Optional<Formation> findById(@Param("id") Long id);

    // ==================== MÉTHODES PAR FORMATEUR ====================

    /**
     * Récupère toutes les formations assignées à un formateur spécifique
     */
    List<Formation> findByFormateurUser(User formateurUser);

    /**
     * ✅ Récupère toutes les formations assignées à un formateur par son ID
     * Utilisation de requête NATIVE car formateurId n'est pas une colonne JPA
     * (c'est une propriété simple, pas une entité)
     */
    @Query(value = "SELECT * FROM formations WHERE formateur_id = :formateurId", nativeQuery = true)
    List<Formation> findByFormateurId(@Param("formateurId") Long formateurId);

    /**
     * Récupère toutes les formations assignées à un formateur avec chargement eager
     * ✅ Version native avec jointure
     */
    @Query(value = "SELECT f.* FROM formations f " +
            "LEFT JOIN users created ON f.created_by = created.id " +
            "LEFT JOIN users formateur ON f.formateur_id = formateur.id " +
            "WHERE f.formateur_id = :formateurId", nativeQuery = true)
    List<Formation> findByFormateurIdWithDetails(@Param("formateurId") Long formateurId);

    /**
     * ✅ Version alternative avec méthode dérivée (utilise la colonne formateurId)
     * Spring Data JPA génère automatiquement la requête
     */
    List<Formation> findByFormateurIdOrderByDateDebutAsc(Long formateurId);

    // ==================== MÉTHODES PAR STATUT ====================

    long countByStatut(Formation.StatutFormation statut);
    List<Formation> findByStatut(Formation.StatutFormation statut);

    /**
     * Récupère les formations d'un formateur par statut
     * ✅ Version native pour éviter les problèmes JPA
     */
    @Query(value = "SELECT * FROM formations WHERE formateur_id = :formateurId AND statut = :statut",
            nativeQuery = true)
    List<Formation> findByFormateurIdAndStatut(@Param("formateurId") Long formateurId,
                                               @Param("statut") String statut);

    // ==================== MÉTHODES PAR DATE ====================

    @Query("SELECT f FROM Formation f WHERE f.dateDebut >= CURRENT_DATE ORDER BY f.dateDebut ASC")
    List<Formation> findUpcomingFormations();

    @Query("SELECT f FROM Formation f WHERE f.dateDebut <= CURRENT_DATE AND f.dateFin >= CURRENT_DATE ORDER BY f.dateDebut ASC")
    List<Formation> findCurrentFormations();

    @Query("SELECT f FROM Formation f WHERE f.dateFin < CURRENT_DATE ORDER BY f.dateFin DESC")
    List<Formation> findPastFormations();

    @Query("SELECT f FROM Formation f WHERE f.dateDebut >= :startDate AND f.dateFin <= :endDate ORDER BY f.dateDebut ASC")
    List<Formation> findFormationsBetweenDates(@Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    /**
     * Récupère les formations d'un formateur par période
     * ✅ Version native
     */
    @Query(value = "SELECT * FROM formations WHERE formateur_id = :formateurId AND date_debut >= :startDate ORDER BY date_debut ASC",
            nativeQuery = true)
    List<Formation> findByFormateurIdAndDateDebutAfter(@Param("formateurId") Long formateurId,
                                                       @Param("startDate") LocalDate startDate);

    // ==================== MÉTHODES DE RECHERCHE ====================

    @Query("SELECT f FROM Formation f WHERE LOWER(f.titre) LIKE LOWER(CONCAT('%', :titre, '%'))")
    List<Formation> findByTitreContainingIgnoreCase(@Param("titre") String titre);

    @Query("SELECT f FROM Formation f WHERE LOWER(f.formateur) LIKE LOWER(CONCAT('%', :formateur, '%'))")
    List<Formation> findByFormateurContainingIgnoreCase(@Param("formateur") String formateur);

    @Query("SELECT f FROM Formation f WHERE LOWER(f.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.formateur) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Formation> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Recherche dans les formations d'un formateur spécifique
     * ✅ Version native
     */
    @Query(value = "SELECT * FROM formations WHERE formateur_id = :formateurId AND " +
            "(LOWER(titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(description) LIKE LOWER(CONCAT('%', :keyword, '%')))", nativeQuery = true)
    List<Formation> searchByKeywordForFormateur(@Param("formateurId") Long formateurId,
                                                @Param("keyword") String keyword);

    // ==================== MÉTHODES STATISTIQUES ====================

    long count();

    @Query("SELECT COUNT(f) FROM Formation f WHERE f.statut = :statut")
    long countFormationsByStatut(@Param("statut") Formation.StatutFormation statut);

    /**
     * Compte les formations d'un formateur par statut
     * ✅ Version native
     */
    @Query(value = "SELECT COUNT(*) FROM formations WHERE formateur_id = :formateurId AND statut = :statut",
            nativeQuery = true)
    long countByFormateurIdAndStatut(@Param("formateurId") Long formateurId,
                                     @Param("statut") String statut);

    @Query("SELECT f FROM Formation f ORDER BY f.createdAt DESC")
    Optional<Formation> findMostRecentFormation();

    @Query(value = "SELECT * FROM formations ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<Formation> findRecentFormations(@Param("limit") int limit);

    // ==================== MÉTHODES PAR LIEU ====================

    List<Formation> findByLieu(String lieu);

    @Query("SELECT f FROM Formation f WHERE LOWER(f.lieu) = LOWER(:lieu)")
    List<Formation> findByLieuIgnoreCase(@Param("lieu") String lieu);

    // ==================== MÉTHODES DE DISPONIBILITÉ ====================

    boolean existsByTitre(String titre);

    @Query("SELECT f FROM Formation f WHERE f.capaciteMax > " +
            "(SELECT COALESCE(COUNT(i), 0) FROM InscriptionFormation i WHERE i.formation.id = f.id)")
    List<Formation> findFormationsWithAvailableCapacity();

    /**
     * Vérifie si un formateur a des formations
     * ✅ Version native
     */
    @Query(value = "SELECT EXISTS(SELECT 1 FROM formations WHERE formateur_id = :formateurId LIMIT 1)",
            nativeQuery = true)
    boolean existsByFormateurId(@Param("formateurId") Long formateurId);

    // ==================== MÉTHODES POUR TABLEAU DE BORD ====================

    @Query(value = "SELECT DATE_FORMAT(f.created_at, '%Y-%m') as month, COUNT(*) as count " +
            "FROM formations f " +
            "GROUP BY DATE_FORMAT(f.created_at, '%Y-%m') " +
            "ORDER BY month DESC", nativeQuery = true)
    List<Object[]> getFormationsStatsByMonth();

    @Query(value = "SELECT FORMATDATETIME(f.created_at, 'yyyy-MM') as month, COUNT(*) as count " +
            "FROM formations f " +
            "GROUP BY FORMATDATETIME(f.created_at, 'yyyy-MM') " +
            "ORDER BY month DESC", nativeQuery = true)
    List<Object[]> getFormationsStatsByMonthH2();

    @Query("SELECT COALESCE(SUM(f.capaciteMax), 0) FROM Formation f")
    Long getTotalCapacity();

    @Query("SELECT COALESCE(AVG(f.prix), 0) FROM Formation f")
    Double getAveragePrice();

    @Query(value = "SELECT COALESCE(SUM(sub.nombre_inscrits), 0) FROM (" +
            "SELECT COUNT(i.id) as nombre_inscrits FROM formations f " +
            "LEFT JOIN inscription_formations i ON f.id = i.formation_id " +
            "WHERE f.formateur_id = :formateurId " +
            "GROUP BY f.id) sub", nativeQuery = true)
    Long getTotalInscritsByFormateur(@Param("formateurId") Long formateurId);

    @Query(value = "SELECT f.*, " +
            "(SELECT COUNT(i.id) FROM inscription_formations i WHERE i.formation_id = f.id) as total_inscrits " +
            "FROM formations f " +
            "WHERE f.formateur_id = :formateurId " +
            "ORDER BY f.date_debut ASC", nativeQuery = true)
    List<Object[]> findFormationsByFormateurWithInscritsCount(@Param("formateurId") Long formateurId);

    // ==================== MÉTHODES POUR LE DASHBOARD ====================

    /**
     * Récupère les statistiques d'un formateur
     * ✅ Version native (car JPQL ne peut pas faire new map avec des CASE WHEN sur une propriété non-entity)
     */
    @Query(value = "SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN statut = 'PLANIFIEE' THEN 1 ELSE 0 END) as planifiees, " +
            "SUM(CASE WHEN statut = 'EN_COURS' THEN 1 ELSE 0 END) as enCours, " +
            "SUM(CASE WHEN statut = 'TERMINEE' THEN 1 ELSE 0 END) as terminees " +
            "FROM formations WHERE formateur_id = :formateurId", nativeQuery = true)
    Map<String, Object> getFormateurStats(@Param("formateurId") Long formateurId);
}