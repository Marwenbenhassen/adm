package com.mellita.controller;

import com.mellita.entity.*;
import com.mellita.entity.Formation.StatutFormation;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;


@RestController
@RequestMapping("/api/formations")
@CrossOrigin
public class FormationController {

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InscriptionFormationRepository inscriptionFormationRepository;

    @Autowired
    private PresenceFormationRepository presenceFormationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // ==================== MÉTHODES DE MAPPAGE ====================

    private Map<String, Object> toMap(Formation f) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", f.getId());
        map.put("titre", f.getTitre());
        map.put("titreAr", f.getTitreAr());
        map.put("description", f.getDescription());
        map.put("descriptionAr", f.getDescriptionAr());
        map.put("formateur", f.getFormateur());
        map.put("formateurId", f.getFormateurId());
        map.put("dateDebut", f.getDateDebut());
        map.put("dateFin", f.getDateFin());
        map.put("dureeHeures", f.getDureeHeures());
        map.put("lieu", f.getLieu());
        map.put("prix", f.getPrix());
        map.put("capaciteMax", f.getCapaciteMax());
        map.put("image", f.getImage());
        map.put("statut", f.getStatut() != null ? f.getStatut().name() : null);
        map.put("createdAt", f.getCreatedAt());

        // Contenu riche
        map.put("contenuHtml", f.getContenuHtml());
        map.put("programme", f.getProgramme());
        map.put("prerequisites", f.getPrerequisites());
        map.put("objectifs", f.getObjectifs());
        map.put("publicCible", f.getPublicCible());
        map.put("certification", f.getCertification());
        map.put("galerieImages", f.getGalerieImages());

        // Sections 1 à 10
        map.put("section1Titre", f.getSection1Titre());
        map.put("section1Texte", f.getSection1Texte());
        map.put("section1Image", f.getSection1Image());
        map.put("section2Titre", f.getSection2Titre());
        map.put("section2Texte", f.getSection2Texte());
        map.put("section2Image", f.getSection2Image());
        map.put("section3Titre", f.getSection3Titre());
        map.put("section3Texte", f.getSection3Texte());
        map.put("section3Image", f.getSection3Image());
        map.put("section4Titre", f.getSection4Titre());
        map.put("section4Texte", f.getSection4Texte());
        map.put("section4Image", f.getSection4Image());
        map.put("section5Titre", f.getSection5Titre());
        map.put("section5Texte", f.getSection5Texte());
        map.put("section5Image", f.getSection5Image());
        map.put("section6Titre", f.getSection6Titre());
        map.put("section6Texte", f.getSection6Texte());
        map.put("section6Image", f.getSection6Image());
        map.put("section7Titre", f.getSection7Titre());
        map.put("section7Texte", f.getSection7Texte());
        map.put("section7Image", f.getSection7Image());
        map.put("section8Titre", f.getSection8Titre());
        map.put("section8Texte", f.getSection8Texte());
        map.put("section8Image", f.getSection8Image());
        map.put("section9Titre", f.getSection9Titre());
        map.put("section9Texte", f.getSection9Texte());
        map.put("section9Image", f.getSection9Image());
        map.put("section10Titre", f.getSection10Titre());
        map.put("section10Texte", f.getSection10Texte());
        map.put("section10Image", f.getSection10Image());

        // ✅ CORRECTION: Accès sécurisé avec gestion du proxy lazy
        if (f.getCreatedBy() != null) {
            try {
                // Forcer l'initialisation si nécessaire
                Hibernate.initialize(f.getCreatedBy());
                map.put("createdById", f.getCreatedBy().getId());
                map.put("createdByNom", f.getCreatedBy().getNom() + " " + f.getCreatedBy().getPrenom());
            } catch (Exception e) {
                map.put("createdById", null);
                map.put("createdByNom", null);
            }
        }

        // ✅ CORRECTION: Accès sécurisé pour formateurUser aussi
        if (f.getFormateurUser() != null) {
            try {
                Hibernate.initialize(f.getFormateurUser());
                map.put("formateurUserNom", f.getFormateurUser().getPrenom() + " " + f.getFormateurUser().getNom());
            } catch (Exception e) {
                // Ignorer
            }
        }

        return map;
    }

    private Map<String, Object> toInscriptionMap(InscriptionFormation i) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", i.getId());
        map.put("presence", i.getPresence() != null && i.getPresence());
        map.put("statutPaiement", i.getStatutPaiement());
        map.put("montantPaye", i.getMontantPaye());
        map.put("dateInscription", i.getDateInscription());
        map.put("certificatDelivre", i.getCertificatDelivre() != null && i.getCertificatDelivre());
        map.put("note", i.getNote());

        Map<String, Object> membre = new HashMap<>();
        try {
            if (i.getMembre() != null) {
                Hibernate.initialize(i.getMembre());
                membre.put("id", i.getMembre().getId());
                membre.put("nom", i.getMembre().getNom() != null ? i.getMembre().getNom() : "");
                membre.put("prenom", i.getMembre().getPrenom() != null ? i.getMembre().getPrenom() : "");
                membre.put("email", i.getMembre().getEmail() != null ? i.getMembre().getEmail() : "");
                membre.put("telephone", i.getMembre().getTelephone() != null ? i.getMembre().getTelephone() : "");
            } else if (i.getMembreNom() != null && !i.getMembreNom().isEmpty()) {
                membre.put("id", null);
                String nomComplet = i.getMembreNom();
                int lastSpace = nomComplet.lastIndexOf(" ");
                if (lastSpace > 0) {
                    membre.put("prenom", nomComplet.substring(0, lastSpace));
                    membre.put("nom", nomComplet.substring(lastSpace + 1));
                } else {
                    membre.put("prenom", nomComplet);
                    membre.put("nom", "");
                }
                membre.put("email", "");
                membre.put("telephone", "");
            } else {
                membre.put("id", null);
                membre.put("nom", "Membre inconnu");
                membre.put("prenom", "");
                membre.put("email", "");
                membre.put("telephone", "");
            }
        } catch (Exception e) {
            membre.put("id", null);
            membre.put("nom", "Membre inconnu");
            membre.put("prenom", "");
            membre.put("email", "");
            membre.put("telephone", "");
        }
        map.put("membre", membre);
        return map;
    }

    // ==================== ENDPOINTS ====================

    @GetMapping("/formateurs-disponibles")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF')")
    public ResponseEntity<List<Map<String, Object>>> getFormateursDisponibles() {
        List<User> formateurs = userRepository.findByRole(Role.FORMATEUR);
        List<Map<String, Object>> result = formateurs.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("nom", u.getNom());
            map.put("prenom", u.getPrenom());
            map.put("email", u.getEmail());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/public")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getPublic() {
        return ResponseEntity.ok(
                formationRepository.findAll()
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF','ROLE_TRESORIER','ROLE_MEMBRE','ROLE_ANIMATEUR','ROLE_FORMATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
                formationRepository.findAll()
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /**
     * Récupère les formations de l'utilisateur connecté
     * - Pour FORMATEUR : formations où il est le formateur assigné
     * - Pour MEMBRE/ANIMATEUR : formations auxquelles il est inscrit
     */
    @GetMapping("/mes-formations")
    @PreAuthorize("hasAnyAuthority('ROLE_MEMBRE','ROLE_FORMATEUR','ROLE_ANIMATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMesFormations(Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Vérifier si l'utilisateur a le rôle FORMATEUR
            boolean isFormateur = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_FORMATEUR"));

            // CAS 1: FORMATEUR → formations où il est le formateur assigné
            if (isFormateur) {
                List<Formation> formations = formationRepository.findByFormateurId(user.getId());

                // ✅ Initialiser les proxies avant de sortir de la transaction
                for (Formation f : formations) {
                    if (f.getCreatedBy() != null) {
                        Hibernate.initialize(f.getCreatedBy());
                    }
                    if (f.getFormateurUser() != null) {
                        Hibernate.initialize(f.getFormateurUser());
                    }
                }

                List<Map<String, Object>> result = formations.stream()
                        .map(this::toMap)
                        .collect(Collectors.toList());

                // Ajouter une information supplémentaire pour le formateur
                for (Map<String, Object> formationMap : result) {
                    Long formationId = (Long) formationMap.get("id");
                    long inscritsCount = inscriptionFormationRepository.countByFormationId(formationId);
                    formationMap.put("totalInscrits", inscritsCount);
                    formationMap.put("role", "FORMATEUR");
                }

                return ResponseEntity.ok(result);
            }

            // CAS 2: MEMBRE ou ANIMATEUR → formations auxquelles il est inscrit
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(
                            "SELECT " +
                                    "  f.id, f.titre, f.titre_ar, f.description, f.description_ar, " +
                                    "  f.formateur, f.formateur_id, f.date_debut, f.date_fin, f.duree_heures, " +
                                    "  f.lieu, f.prix, f.capacite_max, f.image, f.statut, f.created_at, " +
                                    "  i.id as inscription_id, i.presence, i.statut_paiement, i.montant_paye " +
                                    "FROM inscriptions_formations i " +
                                    "INNER JOIN formations f ON i.formation_id = f.id " +
                                    "WHERE i.membre_id = :membreId"
                    )
                    .setParameter("membreId", user.getId())
                    .getResultList();

            List<Map<String, Object>> result = new ArrayList<>();
            String userRole = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ANIMATEUR")) ? "ANIMATEUR" : "MEMBRE";

            for (Object[] row : results) {
                Map<String, Object> map = new HashMap<>();
                int index = 0;
                map.put("id",              row[index++]);
                map.put("titre",           row[index++]);
                map.put("titreAr",         row[index++]);
                map.put("description",     row[index++]);
                map.put("descriptionAr",   row[index++]);
                map.put("formateur",       row[index++]);
                map.put("formateurId",     row[index++]);
                map.put("dateDebut",       row[index++]);
                map.put("dateFin",         row[index++]);
                map.put("dureeHeures",     row[index++]);
                map.put("lieu",            row[index++]);
                map.put("prix",            row[index++]);
                map.put("capaciteMax",     row[index++]);
                map.put("image",           row[index++]);
                map.put("statut",          row[index++]);
                map.put("createdAt",       row[index++]);
                map.put("inscriptionId",   row[index++]);
                map.put("presence",        row[index++]);
                map.put("statutPaiement",  row[index++]);
                map.put("montantPaye",     row[index++]);
                map.put("role",            userRole);
                result.add(map);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation", id));

        // ✅ Initialiser les proxies
        if (formation.getCreatedBy() != null) {
            Hibernate.initialize(formation.getCreatedBy());
        }
        if (formation.getFormateurUser() != null) {
            Hibernate.initialize(formation.getFormateurUser());
        }

        return ResponseEntity.ok(toMap(formation));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF')")
    @Transactional
    public ResponseEntity<Map<String, Object>> create(@RequestBody Formation formation, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        formation.setCreatedBy(user);

        if (formation.getFormateurId() != null) {
            userRepository.findById(formation.getFormateurId()).ifPresent(u -> {
                formation.setFormateur(u.getPrenom() + " " + u.getNom());
                formation.setFormateurId(u.getId());
            });
        }

        Formation saved = formationRepository.save(formation);
        Formation reloaded = formationRepository.findById(saved.getId()).orElse(saved);

        // ✅ Initialiser les proxies
        if (reloaded.getCreatedBy() != null) {
            Hibernate.initialize(reloaded.getCreatedBy());
        }

        return ResponseEntity.ok(toMap(reloaded));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF')")
    @Transactional
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Formation req) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation", id));

        if (req.getTitre() != null) formation.setTitre(req.getTitre());
        if (req.getTitreAr() != null) formation.setTitreAr(req.getTitreAr());
        if (req.getDescription() != null) formation.setDescription(req.getDescription());
        if (req.getDescriptionAr() != null) formation.setDescriptionAr(req.getDescriptionAr());
        if (req.getDateDebut() != null) formation.setDateDebut(req.getDateDebut());
        if (req.getDateFin() != null) formation.setDateFin(req.getDateFin());
        if (req.getDureeHeures() != null) formation.setDureeHeures(req.getDureeHeures());
        if (req.getLieu() != null) formation.setLieu(req.getLieu());
        if (req.getPrix() != null) formation.setPrix(req.getPrix());
        if (req.getCapaciteMax() != null) formation.setCapaciteMax(req.getCapaciteMax());
        if (req.getStatut() != null) formation.setStatut(req.getStatut());
        if (req.getImage() != null) formation.setImage(req.getImage());

        // Contenu riche
        if (req.getContenuHtml() != null) formation.setContenuHtml(req.getContenuHtml());
        if (req.getProgramme() != null) formation.setProgramme(req.getProgramme());
        if (req.getPrerequisites() != null) formation.setPrerequisites(req.getPrerequisites());
        if (req.getObjectifs() != null) formation.setObjectifs(req.getObjectifs());
        if (req.getPublicCible() != null) formation.setPublicCible(req.getPublicCible());
        if (req.getCertification() != null) formation.setCertification(req.getCertification());
        if (req.getGalerieImages() != null) formation.setGalerieImages(req.getGalerieImages());

        // Sections 1 à 10
        if (req.getSection1Titre() != null) formation.setSection1Titre(req.getSection1Titre());
        if (req.getSection1Texte() != null) formation.setSection1Texte(req.getSection1Texte());
        if (req.getSection1Image() != null) formation.setSection1Image(req.getSection1Image());
        if (req.getSection2Titre() != null) formation.setSection2Titre(req.getSection2Titre());
        if (req.getSection2Texte() != null) formation.setSection2Texte(req.getSection2Texte());
        if (req.getSection2Image() != null) formation.setSection2Image(req.getSection2Image());
        if (req.getSection3Titre() != null) formation.setSection3Titre(req.getSection3Titre());
        if (req.getSection3Texte() != null) formation.setSection3Texte(req.getSection3Texte());
        if (req.getSection3Image() != null) formation.setSection3Image(req.getSection3Image());
        if (req.getSection4Titre() != null) formation.setSection4Titre(req.getSection4Titre());
        if (req.getSection4Texte() != null) formation.setSection4Texte(req.getSection4Texte());
        if (req.getSection4Image() != null) formation.setSection4Image(req.getSection4Image());
        if (req.getSection5Titre() != null) formation.setSection5Titre(req.getSection5Titre());
        if (req.getSection5Texte() != null) formation.setSection5Texte(req.getSection5Texte());
        if (req.getSection5Image() != null) formation.setSection5Image(req.getSection5Image());
        if (req.getSection6Titre() != null) formation.setSection6Titre(req.getSection6Titre());
        if (req.getSection6Texte() != null) formation.setSection6Texte(req.getSection6Texte());
        if (req.getSection6Image() != null) formation.setSection6Image(req.getSection6Image());
        if (req.getSection7Titre() != null) formation.setSection7Titre(req.getSection7Titre());
        if (req.getSection7Texte() != null) formation.setSection7Texte(req.getSection7Texte());
        if (req.getSection7Image() != null) formation.setSection7Image(req.getSection7Image());
        if (req.getSection8Titre() != null) formation.setSection8Titre(req.getSection8Titre());
        if (req.getSection8Texte() != null) formation.setSection8Texte(req.getSection8Texte());
        if (req.getSection8Image() != null) formation.setSection8Image(req.getSection8Image());
        if (req.getSection9Titre() != null) formation.setSection9Titre(req.getSection9Titre());
        if (req.getSection9Texte() != null) formation.setSection9Texte(req.getSection9Texte());
        if (req.getSection9Image() != null) formation.setSection9Image(req.getSection9Image());
        if (req.getSection10Titre() != null) formation.setSection10Titre(req.getSection10Titre());
        if (req.getSection10Texte() != null) formation.setSection10Texte(req.getSection10Texte());
        if (req.getSection10Image() != null) formation.setSection10Image(req.getSection10Image());

        if (req.getFormateurId() != null && req.getFormateurId() > 0) {
            userRepository.findById(req.getFormateurId()).ifPresent(u -> {
                formation.setFormateur(u.getPrenom() + " " + u.getNom());
                formation.setFormateurId(u.getId());
            });
        } else if (req.getFormateur() != null) {
            formation.setFormateur(req.getFormateur());
        }

        Formation saved = formationRepository.save(formation);
        Formation reloaded = formationRepository.findById(saved.getId()).orElse(saved);

        // ✅ Initialiser les proxies
        if (reloaded.getCreatedBy() != null) {
            Hibernate.initialize(reloaded.getCreatedBy());
        }

        return ResponseEntity.ok(toMap(reloaded));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (inscriptionFormationRepository.existsByFormationId(id)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Impossible de supprimer une formation avec des inscriptions existantes"));
        }
        formationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Formation supprimée"));
    }

    @PostMapping("/{formationId}/inscriptions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF','ROLE_MEMBRE')")
    @Transactional
    public ResponseEntity<Map<String, Object>> inscrireMembre(
            @PathVariable Long formationId,
            @RequestBody Map<String, Object> body) {

        Long membreId = ((Number) body.get("membreId")).longValue();
        Double prixPaye = body.containsKey("prixPaye")
                ? ((Number) body.get("prixPaye")).doubleValue() : 0.0;

        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new ResourceNotFoundException("Formation", formationId));
        User membre = userRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", membreId));

        if (formation.getStatut() != StatutFormation.PLANIFIEE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vous ne pouvez vous inscrire qu'aux formations à venir",
                    "statutActuel", formation.getStatut().toString()
            ));
        }

        long inscritsCount = inscriptionFormationRepository.countByFormationId(formationId);
        if (inscritsCount >= formation.getCapaciteMax()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cette formation a atteint sa capacité maximale",
                    "capaciteMax", formation.getCapaciteMax(),
                    "inscrits", inscritsCount
            ));
        }

        if (inscriptionFormationRepository.existsByFormationIdAndMembreId(formationId, membreId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vous êtes déjà inscrit à cette formation"));
        }

        String motivation = body.containsKey("motivation") ? body.get("motivation").toString() : null;

        InscriptionFormation inscription = InscriptionFormation.builder()
                .formation(formation)
                .membre(membre)
                .dateInscription(LocalDate.now())
                .montantPaye(prixPaye)
                .statutPaiement(prixPaye >= formation.getPrix() ? "PAYE" : "EN_ATTENTE")
                .presence(true)
                .build();

        if (motivation != null && !motivation.isEmpty()) {
            inscription.setMotivation(motivation);
        }

        inscriptionFormationRepository.save(inscription);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Demande d'inscription à la formation envoyée avec succès",
                "formationId", formationId,
                "membreId", membreId,
                "prixPaye", prixPaye));
    }

    @GetMapping("/{id}/inscriptions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF','ROLE_FORMATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getInscrits(@PathVariable Long id) {
        try {
            List<InscriptionFormation> inscriptions = inscriptionFormationRepository.findByFormationIdWithMembre(id);

            // ✅ Initialiser les proxies
            for (InscriptionFormation insc : inscriptions) {
                if (insc.getMembre() != null) {
                    Hibernate.initialize(insc.getMembre());
                }
                if (insc.getFormation() != null && insc.getFormation().getCreatedBy() != null) {
                    Hibernate.initialize(insc.getFormation().getCreatedBy());
                }
            }

            List<Map<String, Object>> result = inscriptions.stream()
                    .map(this::toInscriptionMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @PutMapping("/{formationId}/inscriptions/{inscriptionId}/presence")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF','ROLE_FORMATEUR')")
    @Transactional
    public ResponseEntity<Map<String, Object>> updatePresence(
            @PathVariable Long formationId,
            @PathVariable Long inscriptionId,
            @RequestBody Map<String, Object> body) {

        Boolean present = (Boolean) body.get("present");
        InscriptionFormation inscription = inscriptionFormationRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription", inscriptionId));

        if (!inscription.getFormation().getId().equals(formationId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cette inscription n'appartient pas à cette formation"));
        }

        inscription.setPresence(present);
        inscriptionFormationRepository.save(inscription);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "inscriptionId", inscriptionId,
                "present", present));
    }

    @GetMapping("/{formationId}/presences")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF','ROLE_FORMATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getPresencesByDate(
            @PathVariable Long formationId,
            @RequestParam String date) {
        LocalDate datePresence = LocalDate.parse(date);
        List<PresenceFormation> presences = presenceFormationRepository.findByFormationIdAndDatePresence(formationId, datePresence);
        List<Map<String, Object>> result = presences.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("membreId", p.getMembre().getId());
            map.put("present", p.getPresent());
            map.put("datePresence", p.getDatePresence());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{formationId}/presences/batch")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF','ROLE_FORMATEUR')")
    @Transactional
    public ResponseEntity<Map<String, Object>> savePresencesBatch(
            @PathVariable Long formationId,
            @RequestBody Map<String, Object> body) {
        String dateStr = (String) body.get("dateSeance");
        LocalDate datePresence = LocalDate.parse(dateStr);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> presencesData = (List<Map<String, Object>>) body.get("presences");
        
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new ResourceNotFoundException("Formation", formationId));

        for (Map<String, Object> pd : presencesData) {
            Long membreId = ((Number) pd.get("membreId")).longValue();
            Boolean present = (Boolean) pd.get("present");
            
            PresenceFormation presence = presenceFormationRepository
                    .findByFormationIdAndMembreIdAndDatePresence(formationId, membreId, datePresence)
                    .orElse(new PresenceFormation());
            
            if (presence.getId() == null) {
                presence.setFormation(formation);
                User membre = userRepository.findById(membreId)
                        .orElseThrow(() -> new ResourceNotFoundException("Membre", membreId));
                presence.setMembre(membre);
                presence.setDatePresence(datePresence);
            }
            presence.setPresent(present);
            presenceFormationRepository.save(presence);
        }
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Présences enregistrées avec succès"));
    }

    @DeleteMapping("/{formationId}/inscriptions/{inscriptionId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF')")
    @Transactional
    public ResponseEntity<Map<String, Object>> desinscrireMembre(
            @PathVariable Long formationId,
            @PathVariable Long inscriptionId) {

        InscriptionFormation inscription = inscriptionFormationRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription", inscriptionId));

        if (!inscription.getFormation().getId().equals(formationId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cette inscription n'appartient pas à cette formation"));
        }

        inscriptionFormationRepository.delete(inscription);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Membre désinscrit avec succès"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFormations", formationRepository.count());
        stats.put("formationsPlanifiees",
                formationRepository.countByStatut(StatutFormation.PLANIFIEE));
        stats.put("formationsEnCours",
                formationRepository.countByStatut(StatutFormation.EN_COURS));
        stats.put("formationsTerminees",
                formationRepository.countByStatut(StatutFormation.TERMINEE));
        stats.put("totalInscriptions", inscriptionFormationRepository.count());
        return ResponseEntity.ok(stats);
    }
}