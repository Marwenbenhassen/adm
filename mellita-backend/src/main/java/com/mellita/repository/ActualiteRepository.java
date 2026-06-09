package com.mellita.repository;

import com.mellita.entity.Actualite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActualiteRepository extends JpaRepository<Actualite, Long> {

    @Query("SELECT a FROM Actualite a LEFT JOIN FETCH a.auteur WHERE a.publie = true ORDER BY a.createdAt DESC")
    List<Actualite> findByPublieOrderByCreatedAtDesc(@Param("publie") boolean publie);

    @Query("SELECT a FROM Actualite a LEFT JOIN FETCH a.auteur ORDER BY a.createdAt DESC")
    List<Actualite> findByOrderByCreatedAtDesc();

    @Query("SELECT a FROM Actualite a LEFT JOIN FETCH a.auteur WHERE a.id = :id")
    Optional<Actualite> findById(@Param("id") Long id);
}