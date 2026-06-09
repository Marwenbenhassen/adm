package com.mellita.controller;

import com.mellita.entity.EcritureComptable;
import com.mellita.entity.User;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.EcritureComptableRepository;
import com.mellita.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ecritures")
@CrossOrigin
public class EcritureController {

    @Autowired private EcritureComptableRepository ecritureRepository;
    @Autowired private UserRepository userRepository;

    // ===== CONSULTER TOUTES LES ÉCRITURES (ADMIN / TRÉSORIER) =====
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER','ADMINISTRATIF')")
    public ResponseEntity<List<EcritureComptable>> getAll() {
        return ResponseEntity.ok(ecritureRepository.findAllByOrderByDateEcritureDesc());
    }

    // ===== EN ATTENTE DE VALIDATION =====
    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<List<EcritureComptable>> getEnAttente() {
        return ResponseEntity.ok(ecritureRepository
                .findByStatutOrderByCreatedAtDesc(EcritureComptable.StatutEcriture.EN_ATTENTE));
    }

    // ===== SAISIR UNE ÉCRITURE (ADMIN / ADMINISTRATIF) - VERSION CORRIGÉE =====
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();

            EcritureComptable ecriture = new EcritureComptable();

            // Récupérer la description/libellé
            String description = body.get("description") != null ? body.get("description").toString() : null;
            if (description == null) {
                description = body.get("libelle") != null ? body.get("libelle").toString() : "Écriture comptable";
            }
            ecriture.setLibelle(description);
            ecriture.setDescription(description);

            // Récupérer le montant
            Object montantObj = body.get("montant");
            double montant = 0.0;
            if (montantObj instanceof Integer) {
                montant = ((Integer) montantObj).doubleValue();
            } else if (montantObj instanceof Double) {
                montant = (Double) montantObj;
            } else if (montantObj instanceof String) {
                montant = Double.parseDouble((String) montantObj);
            }
            ecriture.setMontant(montant);

            // Récupérer le type (RECETTE ou DEPENSE)
            String typeStr = body.get("type") != null ? body.get("type").toString() : "RECETTE";
            if ("RECETTE".equalsIgnoreCase(typeStr)) {
                ecriture.setType(EcritureComptable.TypeEcriture.RECETTE);
            } else {
                ecriture.setType(EcritureComptable.TypeEcriture.DEPENSE);
            }

            // Définir la catégorie par défaut
            ecriture.setCategorie(EcritureComptable.CategorieEcriture.COTISATION);

            // Date de l'écriture
            ecriture.setDateEcriture(LocalDate.now());

            // Statut par défaut
            ecriture.setStatut(EcritureComptable.StatutEcriture.EN_ATTENTE);

            // Utilisateur qui saisit
            ecriture.setSaisiPar(user);

            // Associations optionnelles
            if (body.get("membreId") != null) {
                Long membreId = Long.valueOf(body.get("membreId").toString());
                userRepository.findById(membreId).ifPresent(ecriture::setMembre);
            }

            // Stocker les IDs supplémentaires dans la description si nécessaire
            if (body.get("clubId") != null) {
                String clubInfo = " (Club ID: " + body.get("clubId") + ")";
                ecriture.setLibelle(ecriture.getLibelle() + clubInfo);
            }

            if (body.get("evenementId") != null) {
                String eventInfo = " (Événement ID: " + body.get("evenementId") + ")";
                ecriture.setLibelle(ecriture.getLibelle() + eventInfo);
            }

            if (body.get("formationId") != null) {
                String formationInfo = " (Formation ID: " + body.get("formationId") + ")";
                ecriture.setLibelle(ecriture.getLibelle() + formationInfo);
            }

            EcritureComptable saved = ecritureRepository.save(ecriture);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", saved.getId());
            response.put("message", "Écriture créée avec succès");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ===== VALIDER (TRÉSORIER ou ADMIN) =====
    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<EcritureComptable> valider(
            @PathVariable Long id, Authentication auth) {
        EcritureComptable ecriture = ecritureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Écriture", id));
        User valideur = userRepository.findByEmail(auth.getName()).orElseThrow();

        ecriture.setStatut(EcritureComptable.StatutEcriture.VALIDEE);
        ecriture.setValidePar(valideur);
        ecriture.setDateValidation(LocalDateTime.now());
        return ResponseEntity.ok(ecritureRepository.save(ecriture));
    }

    // ===== REJETER (TRÉSORIER ou ADMIN) =====
    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<EcritureComptable> rejeter(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        EcritureComptable ecriture = ecritureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Écriture", id));
        User valideur = userRepository.findByEmail(auth.getName()).orElseThrow();

        ecriture.setStatut(EcritureComptable.StatutEcriture.REJETEE);
        ecriture.setValidePar(valideur);
        ecriture.setDateValidation(LocalDateTime.now());
        ecriture.setMotifRejet(body.getOrDefault("motif", "Rejetée sans motif"));
        return ResponseEntity.ok(ecritureRepository.save(ecriture));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        ecritureRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Écriture supprimée"));
    }

    // ===== BILAN FINANCIER (écritures validées uniquement) =====
    @GetMapping("/bilan")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Map<String, Object>> getBilan() {
        Double recettes = ecritureRepository.sumRecettesValidees();
        Double depenses = ecritureRepository.sumDepensesValidees();
        recettes = recettes != null ? recettes : 0.0;
        depenses = depenses != null ? depenses : 0.0;

        long enAttente = ecritureRepository
                .findByStatutOrderByCreatedAtDesc(EcritureComptable.StatutEcriture.EN_ATTENTE).size();

        Map<String, Object> bilan = new HashMap<>();
        bilan.put("totalRecettes", recettes);
        bilan.put("totalDepenses", depenses);
        bilan.put("solde", recettes - depenses);
        bilan.put("ecrituresEnAttente", enAttente);
        bilan.put("totalEcritures", ecritureRepository.count());
        return ResponseEntity.ok(bilan);
    }
}