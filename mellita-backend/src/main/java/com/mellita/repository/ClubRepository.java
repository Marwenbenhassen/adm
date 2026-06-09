package com.mellita.repository;

import com.mellita.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    @Query("SELECT c FROM Club c LEFT JOIN FETCH c.animateur LEFT JOIN FETCH c.createdBy")
    List<Club> findAll();

    @Query("SELECT c FROM Club c LEFT JOIN FETCH c.animateur LEFT JOIN FETCH c.createdBy WHERE c.statut = :statut")
    List<Club> findByStatut(@Param("statut") Club.StatutClub statut);

    @Query("SELECT c FROM Club c LEFT JOIN FETCH c.animateur LEFT JOIN FETCH c.createdBy WHERE c.animateur.id = :animateurId")
    List<Club> findByAnimateurId(@Param("animateurId") Long animateurId);

    @Query("SELECT c FROM Club c LEFT JOIN FETCH c.animateur LEFT JOIN FETCH c.createdBy WHERE c.id = :id")
    Optional<Club> findById(@Param("id") Long id);

    Optional<Club> findByNom(String nom);
}