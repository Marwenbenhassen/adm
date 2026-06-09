package com.mellita.repository;

import com.mellita.entity.Role;
import com.mellita.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ===== RECHERCHE PAR EMAIL =====
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    // ===== RECHERCHE PAR RÔLE =====
    // ✅ CORRIGÉ : Utilise Role enum au lieu de String
    List<User> findByRole(Role role);

    List<User> findByRoleOrderByNomAsc(Role role);

    List<User> findByRoleOrderByDateAdhesionDesc(Role role);

    List<User> findByRoleIn(List<Role> roles);

    // ===== RECHERCHE PAR STATUT =====
    List<User> findByStatut(User.StatutMembre statut);

    List<User> findByStatutOrderByNomAsc(User.StatutMembre statut);

    // ===== RECHERCHE PAR RÔLE ET STATUT =====
    List<User> findByRoleAndStatut(Role role, User.StatutMembre statut);

    List<User> findByRoleInAndStatut(List<Role> roles, User.StatutMembre statut);

    // ===== RECHERCHE PAR NOM / PRÉNOM / EMAIL =====
    List<User> findByNomContainingIgnoreCase(String nom);

    List<User> findByPrenomContainingIgnoreCase(String prenom);

    List<User> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);

    @Query("SELECT u FROM User u WHERE LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchUsers(@Param("search") String search);

    // ===== RECHERCHE PAR DATE =====
    List<User> findByDateAdhesionBetween(LocalDate startDate, LocalDate endDate);

    List<User> findByDateAdhesionAfter(LocalDate date);

    List<User> findByDateAdhesionBefore(LocalDate date);

    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // ===== RECHERCHE PAR FORCE PASSWORD CHANGE =====
    List<User> findByForcePasswordChangeTrue();

    // ===== STATISTIQUES ET COMPTAGES =====
    long countByRole(Role role);

    long countByStatut(User.StatutMembre statut);

    long countByRoleAndStatut(Role role, User.StatutMembre statut);

    @Query("SELECT COUNT(u) FROM User u WHERE u.dateAdhesion BETWEEN :startDate AND :endDate")
    long countNewMembersBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.dateAdhesion BETWEEN :startDate AND :endDate")
    long countNewMembersByRoleBetweenDates(@Param("role") Role role, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // ===== STATISTIQUES GROUPÉES =====
    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();

    @Query("SELECT u.statut, COUNT(u) FROM User u GROUP BY u.statut")
    List<Object[]> countUsersByStatut();

    @Query("SELECT YEAR(u.dateAdhesion), MONTH(u.dateAdhesion), COUNT(u) FROM User u GROUP BY YEAR(u.dateAdhesion), MONTH(u.dateAdhesion) ORDER BY YEAR(u.dateAdhesion) DESC, MONTH(u.dateAdhesion) DESC")
    List<Object[]> countUsersByMonth();

    // ===== RECHERCHE DES DERNIERS MEMBRES =====
    @Query("SELECT u FROM User u ORDER BY u.dateAdhesion DESC")
    List<User> findLastUsers();

    @Query("SELECT u FROM User u ORDER BY u.dateAdhesion DESC LIMIT :limit")
    List<User> findLastUsersWithLimit(@Param("limit") int limit);

    // ===== RECHERCHE PAR TÉLÉPHONE =====
    Optional<User> findByTelephone(String telephone);

    boolean existsByTelephone(String telephone);

    // ===== MEMBRES SANS INSCRIPTION À UN CLUB =====
    @Query("SELECT u FROM User u WHERE u.role = 'MEMBRE' AND u.id NOT IN (SELECT i.membre.id FROM InscriptionClub i)")
    List<User> findMembresWithoutClub();

    // ===== MEMBRES NON PAYEURS =====
    @Query("SELECT u FROM User u WHERE u.role = 'MEMBRE' AND u.id IN (SELECT i.membre.id FROM InscriptionClub i WHERE i.paye = false)")
    List<User> findMembresWithPendingPayments();

    // ===== MISE À JOUR BULK =====
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.forcePasswordChange = :force WHERE u.id = :id")
    void updateForcePasswordChange(@Param("id") Long id, @Param("force") boolean force);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.statut = :statut WHERE u.id = :id")
    void updateStatut(@Param("id") Long id, @Param("statut") User.StatutMembre statut);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.motDePasse = :password, u.forcePasswordChange = false WHERE u.id = :id")
    void updatePassword(@Param("id") Long id, @Param("password") String password);

    // ===== SUPPRESSION =====
    @Modifying
    @Transactional
    void deleteByEmail(String email);

    @Modifying
    @Transactional
    void deleteByRole(Role role);

    // ===== VÉRIFICATIONS =====
    boolean existsByNomAndPrenom(String nom, String prenom);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.role = :role")
    boolean existsByEmailAndRole(@Param("email") String email, @Param("role") Role role);
    List<User> findByEmailContainingIgnoreCase(String email);
}