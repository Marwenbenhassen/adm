package com.mellita.ged.controller;

import com.mellita.ged.entity.Category;
import com.mellita.ged.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    /**
     * Récupère toutes les catégories actives
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findByActiveTrue());
    }

    /**
     * Crée une nouvelle catégorie (ADMIN uniquement)
     * ✅ MODIFIÉ : Vérifie uniquement les catégories actives
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            // Vérifier si une catégorie ACTIVE avec ce nom existe déjà
            Category existing = categoryRepository.findByName(category.getName()).orElse(null);

            if (existing != null && existing.getActive()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Une catégorie active avec ce nom existe déjà");
                return ResponseEntity.badRequest().body(error);
            }

            // Si la catégorie existe mais est inactive, on la réactive
            if (existing != null && !existing.getActive()) {
                existing.setActive(true);
                existing.setDescription(category.getDescription());
                Category saved = categoryRepository.save(existing);
                return ResponseEntity.ok(saved);
            }

            // Nouvelle catégorie
            category.setActive(true);
            Category saved = categoryRepository.save(category);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la création: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Met à jour une catégorie (ADMIN uniquement)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category existingCategory = categoryRepository.findById(id).orElse(null);
            if (existingCategory == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Catégorie non trouvée");
                return ResponseEntity.badRequest().body(error);
            }

            // Vérifier si le nouveau nom existe déjà (sauf pour la même catégorie)
            if (!existingCategory.getName().equals(category.getName())) {
                Category duplicate = categoryRepository.findByName(category.getName()).orElse(null);
                if (duplicate != null && duplicate.getActive() && !duplicate.getId().equals(id)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Une catégorie active avec ce nom existe déjà");
                    return ResponseEntity.badRequest().body(error);
                }
            }

            existingCategory.setName(category.getName());
            existingCategory.setDescription(category.getDescription());
            existingCategory.setActive(true);

            Category updated = categoryRepository.save(existingCategory);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la mise à jour: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Supprime (désactive) une catégorie (ADMIN uniquement)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Catégorie non trouvée");
            return ResponseEntity.badRequest().body(error);
        }
        category.setActive(false);
        categoryRepository.save(category);
        return ResponseEntity.ok(Map.of("message", "Catégorie supprimée avec succès"));
    }

    /**
     * Suppression définitive d'une catégorie (ADMIN uniquement)
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> hardDeleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Catégorie non trouvée");
            return ResponseEntity.badRequest().body(error);
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Catégorie supprimée définitivement"));
    }
}