package com.mellita.repository;

import com.mellita.entity.InscriptionClub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionClubRepository extends JpaRepository<InscriptionClub, Long> {

    List<InscriptionClub> findByClubId(Long clubId);

    List<InscriptionClub> findByMembreId(Long membreId);

    // ⭐ NOUVELLE MÉTHODE avec FETCH JOIN pour éviter LazyInitializationException
    @Query("SELECT i FROM InscriptionClub i " +
            "LEFT JOIN FETCH i.club c " +
            "LEFT JOIN FETCH c.animateur " +
            "WHERE i.membre.id = :membreId")
    List<InscriptionClub> findByMembreIdWithClubAndAnimateur(@Param("membreId") Long membreId);

    Optional<InscriptionClub> findByMembreIdAndClubId(Long membreId, Long clubId);

    List<InscriptionClub> findByClubIdAndStatut(Long clubId, InscriptionClub.StatutInscription statut);

    long countByClubId(Long clubId);

    void deleteByClubId(Long clubId);
}