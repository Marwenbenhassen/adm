package com.mellita.ged.repository;

import com.mellita.ged.entity.GedAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GedAuditRepository extends JpaRepository<GedAuditLog, Long> {
    List<GedAuditLog> findByDocumentIdOrderByPerformedAtDesc(Long documentId);
}