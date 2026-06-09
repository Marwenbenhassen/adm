package com.mellita.ged.repository;

import com.mellita.ged.entity.GedDocument;
import com.mellita.ged.enums.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GedDocumentRepository extends JpaRepository<GedDocument, Long> {

    Page<GedDocument> findByStatus(DocumentStatus status, Pageable pageable);

    // ✅ MODIFICATION : DocumentCategory → String
    @Query("SELECT d FROM GedDocument d WHERE " +
            "(:title IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:category IS NULL OR d.category = :category) AND " +
            "(:year IS NULL OR d.year = :year) AND " +
            "(:status IS NULL OR d.status = :status)")
    Page<GedDocument> search(@Param("title") String title,
                             @Param("category") String category,
                             @Param("year") Integer year,
                             @Param("status") DocumentStatus status,
                             Pageable pageable);

    // ✅ MODIFICATION : DocumentCategory → String
    @Query("SELECT d FROM GedDocument d WHERE " +
            "(:title IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:category IS NULL OR d.category = :category) AND " +
            "(:year IS NULL OR d.year = :year) AND " +
            "(:status IS NULL OR d.status = :status) AND " +
            "(d.visibleToAll = true OR d.createdBy = :username)")
    Page<GedDocument> searchForTresorier(@Param("title") String title,
                                         @Param("category") String category,
                                         @Param("year") Integer year,
                                         @Param("status") DocumentStatus status,
                                         @Param("username") String username,
                                         Pageable pageable);

    // ✅ MODIFICATION : DocumentCategory → String
    @Query("SELECT d FROM GedDocument d WHERE " +
            "(:title IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:category IS NULL OR d.category = :category) AND " +
            "(:year IS NULL OR d.year = :year) AND " +
            "(:status IS NULL OR d.status = :status) AND " +
            "(d.visibleToAll = true OR " +
            "(d.allowedRoles IS NOT NULL AND d.allowedRoles != '' AND d.allowedRoles LIKE CONCAT('%', :role, '%')))")
    Page<GedDocument> searchForUser(@Param("title") String title,
                                    @Param("category") String category,
                                    @Param("year") Integer year,
                                    @Param("status") DocumentStatus status,
                                    @Param("role") String role,
                                    Pageable pageable);

    // ✅ MODIFICATION : DocumentCategory → String
    @Query("SELECT d FROM GedDocument d WHERE " +
            "(:title IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:category IS NULL OR d.category = :category) AND " +
            "(:year IS NULL OR d.year = :year) AND " +
            "(:status IS NULL OR d.status = :status) AND " +
            "(d.visibleToAll = true OR (d.allowedRoles IS NOT NULL AND d.allowedRoles != '' AND d.allowedRoles LIKE CONCAT('%', :role, '%')) OR d.createdBy = :username)")
    Page<GedDocument> searchForAdministratif(@Param("title") String title,
                                             @Param("category") String category,
                                             @Param("year") Integer year,
                                             @Param("status") DocumentStatus status,
                                             @Param("role") String role,
                                             @Param("username") String username,
                                             Pageable pageable);
}