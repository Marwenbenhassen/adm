package com.mellita.repository;

import com.mellita.entity.PresenceFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PresenceFormationRepository extends JpaRepository<PresenceFormation, Long> {
    List<PresenceFormation> findByFormationIdAndDatePresence(Long formationId, LocalDate date);
    Optional<PresenceFormation> findByFormationIdAndMembreIdAndDatePresence(Long formationId, Long membreId, LocalDate date);
}