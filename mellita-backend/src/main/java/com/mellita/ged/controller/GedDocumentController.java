package com.mellita.ged.controller;

import com.mellita.ged.service.GedDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ged/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class GedDocumentController {

    private final GedDocumentService gedDocumentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF', 'TRESORIER')")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("year") Integer year,
            @RequestParam(value = "description", required = false) String description) {

        try {
            String fileName = file.getOriginalFilename();
            String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

            if (!extension.matches("pdf|doc|docx|xls|xlsx|jpg|jpeg|png")) {
                return ResponseEntity.badRequest().body("Seuls les formats PDF, Word, Excel et Image (JPG, PNG) sont autorisés");
            }

            String categoryUpper = category.toUpperCase().trim();
            System.out.println("📤 Upload - Catégorie reçue: " + categoryUpper);

            var result = gedDocumentService.uploadDocument(file, title, description, categoryUpper, year);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Catégorie invalide: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF', 'TRESORIER', 'MEMBRE', 'FORMATEUR', 'ANIMATEUR')")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = gedDocumentService.downloadDocument(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<?>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false, name = "category") String category,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            Pageable pageable) {

        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().toString();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(gedDocumentService.search(title, category, year, status, role, username, pageable));
    }

    @PutMapping("/archive/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<?> archive(@PathVariable Long id) {
        return ResponseEntity.ok(gedDocumentService.archiveDocument(id));
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<?> restore(@PathVariable Long id) {
        return ResponseEntity.ok(gedDocumentService.restoreDocument(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        gedDocumentService.deleteDocument(id);
        return ResponseEntity.ok(Map.of("message", "Document supprimé définitivement"));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRESORIER', 'ADMINISTRATIF')")
    public ResponseEntity<?> updatePermissions(@PathVariable Long id,
                                               @RequestBody Map<String, Object> permissions) {
        try {
            String allowedRoles = (String) permissions.get("allowedRoles");
            Boolean visibleToAll = (Boolean) permissions.get("visibleToAll");

            var updated = gedDocumentService.updatePermissions(id, allowedRoles, visibleToAll);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/delete-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllDocuments() {
        gedDocumentService.deleteAllDocuments();
        return ResponseEntity.ok(Map.of("message", "Tous les documents ont été supprimés"));
    }

    @DeleteMapping("/admin/delete-selected")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSelectedDocuments(@RequestBody List<Long> ids) {
        gedDocumentService.deleteSelectedDocuments(ids);
        return ResponseEntity.ok(Map.of("message", "Documents supprimés avec succès"));
    }
}