package com.mellita.controller;

import com.mellita.entity.Document;
import com.mellita.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ======================== DOCUMENT CONTROLLER ========================
@RestController
@RequestMapping("/api/documents")
@CrossOrigin
class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Document>> getAll() {
        return ResponseEntity.ok(documentRepository.findByOrderByCreatedAtDesc());
    }

    @GetMapping("/public")
    public ResponseEntity<List<Document>> getPublic() {
        return ResponseEntity.ok(documentRepository.findByVisibilite(Document.Visibilite.PUBLIC));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Document> create(@RequestBody Document document) {
        return ResponseEntity.ok(documentRepository.save(document));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        documentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Document supprimé"));
    }
}
