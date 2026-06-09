package com.mellita.ged.service;

import com.mellita.ged.entity.GedDocument;
import com.mellita.ged.entity.GedAuditLog;
import com.mellita.ged.enums.DocumentStatus;
import com.mellita.ged.enums.ActionType;
import com.mellita.ged.repository.GedDocumentRepository;
import com.mellita.ged.repository.GedAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GedDocumentService {

    private final GedDocumentRepository gedDocumentRepository;
    private final GedAuditRepository gedAuditRepository;
    private final FileStorageService fileStorageService;

    // ✅ MODIFICATION : category devient String
    public GedDocument uploadDocument(MultipartFile file, String title, String description,
                                      String category, Integer year) {
        try {
            String username = getCurrentUsername();
            String filePath = fileStorageService.saveFile(file);

            GedDocument document = new GedDocument();
            document.setFileName(file.getOriginalFilename());
            document.setFilePath(filePath);
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setTitle(title);
            document.setDescription(description);
            document.setCategory(category); // Maintenant c'est un String
            document.setYear(year);
            document.setStatus(DocumentStatus.ACTIVE);
            document.setCreatedBy(username);
            document.setVisibleToAll(true);

            GedDocument saved = gedDocumentRepository.save(document);
            logAction(saved.getId(), saved.getFileName(), ActionType.UPLOAD, username);

            System.out.println("✅ Document uploadé avec catégorie: " + category);
            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'upload: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Resource downloadDocument(Long id) {
        try {
            GedDocument document = gedDocumentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document non trouvé"));

            String currentRole = getCurrentRole();
            String username = getCurrentUsername();

            if ("ADMINISTRATIF".equals(currentRole)) {
                if (!document.isVisibleToAll() && (document.getAllowedRoles() == null || !document.getAllowedRoles().contains(currentRole)) &&
                        !document.getCreatedBy().equals(username)) {
                    throw new RuntimeException("Vous n'avez pas les droits pour télécharger ce document");
                }
            } else if (!"ADMIN".equals(currentRole) && !document.isVisibleToAll() &&
                    (document.getAllowedRoles() == null || !document.getAllowedRoles().contains(currentRole)) &&
                    !document.getCreatedBy().equals(username)) {
                throw new RuntimeException("Vous n'avez pas les droits pour télécharger ce document");
            }

            logAction(document.getId(), document.getFileName(), ActionType.DOWNLOAD, username);

            InputStream inputStream = fileStorageService.loadFile(document.getFilePath());
            return new InputStreamResource(inputStream);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du téléchargement: " + e.getMessage());
        }
    }

    // ✅ MODIFICATION : category devient String
    @Transactional(readOnly = true)
    public Page<GedDocument> search(String title, String category, Integer year,
                                    String status, String role, String username, Pageable pageable) {
        DocumentStatus docStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                docStatus = DocumentStatus.valueOf(status);
            } catch (IllegalArgumentException e) {}
        }

        if (role.contains("ROLE_ADMIN")) {
            return gedDocumentRepository.search(title, category, year, docStatus, pageable);
        }

        if (role.contains("ROLE_TRESORIER")) {
            return gedDocumentRepository.searchForTresorier(title, category, year, docStatus, username, pageable);
        }

        if (role.contains("ROLE_ADMINISTRATIF")) {
            return gedDocumentRepository.searchForAdministratif(title, category, year, docStatus, "ROLE_ADMINISTRATIF", username, pageable);
        }

        String roleName = getRoleName(role);
        return gedDocumentRepository.searchForUser(title, category, year, docStatus, roleName, pageable);
    }

    public GedDocument archiveDocument(Long id) {
        String username = getCurrentUsername();
        GedDocument document = gedDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        document.setStatus(DocumentStatus.ARCHIVED);
        document.setArchivedAt(LocalDateTime.now());
        document.setArchivedBy(username);

        logAction(document.getId(), document.getFileName(), ActionType.ARCHIVE, username);

        return gedDocumentRepository.save(document);
    }

    public GedDocument restoreDocument(Long id) {
        String username = getCurrentUsername();
        GedDocument document = gedDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        document.setStatus(DocumentStatus.ACTIVE);
        document.setArchivedAt(null);
        document.setArchivedBy(null);

        logAction(document.getId(), document.getFileName(), ActionType.RESTORE, username);

        return gedDocumentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        String username = getCurrentUsername();
        GedDocument document = gedDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        logAction(document.getId(), document.getFileName(), ActionType.DELETE, username);
        gedDocumentRepository.deleteById(id);
    }

    public GedDocument updatePermissions(Long id, String allowedRoles, Boolean visibleToAll) {
        GedDocument document = gedDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        String currentRole = getCurrentRole();
        String username = getCurrentUsername();

        if (!"ADMIN".equals(currentRole) && !"TRESORIER".equals(currentRole) && !"ADMINISTRATIF".equals(currentRole) && !document.getCreatedBy().equals(username)) {
            throw new RuntimeException("Vous n'avez pas les droits pour modifier ce document");
        }

        if (allowedRoles != null) {
            document.setAllowedRoles(allowedRoles);
        }
        if (visibleToAll != null) {
            document.setVisibleToAll(visibleToAll);
            if (visibleToAll) {
                document.setAllowedRoles(null);
            }
        }

        logAction(document.getId(), document.getFileName(), ActionType.UPDATE, username);
        return gedDocumentRepository.save(document);
    }

    public void deleteAllDocuments() {
        String currentRole = getCurrentRole();
        if (!"ADMIN".equals(currentRole)) {
            throw new RuntimeException("Seul l'administrateur peut supprimer tous les documents");
        }
        gedDocumentRepository.deleteAll();
        System.out.println("🗑️ Tous les documents ont été supprimés par " + getCurrentUsername());
    }

    public void deleteSelectedDocuments(List<Long> ids) {
        String currentRole = getCurrentRole();
        if (!"ADMIN".equals(currentRole)) {
            throw new RuntimeException("Seul l'administrateur peut supprimer des documents");
        }
        gedDocumentRepository.deleteAllById(ids);
        System.out.println("🗑️ " + ids.size() + " documents supprimés par " + getCurrentUsername());
    }

    @Transactional(readOnly = true)
    public List<GedAuditLog> getAuditHistory(Long documentId) {
        return gedAuditRepository.findByDocumentIdOrderByPerformedAtDesc(documentId);
    }

    private void logAction(Long documentId, String fileName, ActionType action, String username) {
        GedAuditLog audit = new GedAuditLog();
        audit.setDocumentId(documentId);
        audit.setFileName(fileName);
        audit.setAction(action);
        audit.setPerformedBy(username);
        audit.setPerformedAt(LocalDateTime.now());
        gedAuditRepository.save(audit);
    }

    private String getCurrentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "system";
    }

    private String getCurrentRole() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String authorities = authentication.getAuthorities().toString();
            if (authorities.contains("ROLE_ADMIN")) return "ADMIN";
            if (authorities.contains("ROLE_TRESORIER")) return "TRESORIER";
            if (authorities.contains("ROLE_ADMINISTRATIF")) return "ADMINISTRATIF";
            if (authorities.contains("ROLE_FORMATEUR")) return "FORMATEUR";
            if (authorities.contains("ROLE_ANIMATEUR")) return "ANIMATEUR";
            if (authorities.contains("ROLE_MEMBRE")) return "MEMBRE";
        }
        return "UNKNOWN";
    }

    private String getRoleName(String role) {
        if (role.contains("ROLE_FORMATEUR")) return "ROLE_FORMATEUR";
        if (role.contains("ROLE_ANIMATEUR")) return "ROLE_ANIMATEUR";
        if (role.contains("ROLE_MEMBRE")) return "ROLE_MEMBRE";
        if (role.contains("ROLE_TRESORIER")) return "ROLE_TRESORIER";
        if (role.contains("ROLE_ADMINISTRATIF")) return "ROLE_ADMINISTRATIF";
        return "";
    }
}