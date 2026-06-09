package com.mellita.controller;

import com.mellita.entity.Actualite;
import com.mellita.entity.User;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.ActualiteRepository;
import com.mellita.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/actualites")
@CrossOrigin
public class ActualiteController {

    @Autowired private ActualiteRepository actualiteRepository;
    @Autowired private UserRepository userRepository;

    // Méthode utilitaire : Actualite → Map sans entités imbriquées
    private Map<String, Object> toMap(Actualite a) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", a.getId());
        map.put("titre", a.getTitre());
        map.put("titreAr", a.getTitreAr());
        map.put("contenu", a.getContenu());
        map.put("contenuAr", a.getContenuAr());
        map.put("image", a.getImage());
        map.put("categorie", a.getCategorie());
        map.put("publie", a.getPublie());
        map.put("createdAt", a.getCreatedAt());
        map.put("updatedAt", a.getUpdatedAt());

        if (a.getAuteur() != null) {
            map.put("auteurId", a.getAuteur().getId());
            map.put("auteurNom", a.getAuteur().getNom());
            map.put("auteurPrenom", a.getAuteur().getPrenom());
        }
        return map;
    }

    @GetMapping("/publics")
    public ResponseEntity<List<Map<String, Object>>> getPublished() {
        return ResponseEntity.ok(
                actualiteRepository.findByPublieOrderByCreatedAtDesc(true)
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
                actualiteRepository.findByOrderByCreatedAtDesc()
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Actualite a = actualiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actualité", id));
        return ResponseEntity.ok(toMap(a));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Actualite actualite, Authentication auth) {
        if (auth != null) {
            userRepository.findByEmail(auth.getName())
                    .ifPresent(actualite::setAuteur);
        }
        return ResponseEntity.ok(toMap(actualiteRepository.save(actualite)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id, @RequestBody Actualite req) {
        Actualite act = actualiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actualité", id));
        if (req.getTitre() != null) act.setTitre(req.getTitre());
        if (req.getTitreAr() != null) act.setTitreAr(req.getTitreAr());
        if (req.getContenu() != null) act.setContenu(req.getContenu());
        if (req.getContenuAr() != null) act.setContenuAr(req.getContenuAr());
        if (req.getCategorie() != null) act.setCategorie(req.getCategorie());
        if (req.getPublie() != null) act.setPublie(req.getPublie());
        return ResponseEntity.ok(toMap(actualiteRepository.save(act)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        actualiteRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Actualité supprimée"));
    }
}