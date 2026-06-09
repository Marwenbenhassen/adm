package com.mellita.controller;

import com.mellita.entity.Evenement;
import com.mellita.entity.Evenement.StatutEvenement;
import com.mellita.entity.InscriptionEvenement;
import com.mellita.entity.User;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.EvenementRepository;
import com.mellita.repository.InscriptionEvenementRepository;
import com.mellita.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/evenements")
@CrossOrigin(origins = "http://localhost:4200")
public class EvenementController {

    @Autowired private EvenementRepository evenementRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InscriptionEvenementRepository inscriptionEvenementRepository;

    @GetMapping("/public")
    public ResponseEntity<List<Evenement>> getPublicEvents() {
        return ResponseEntity.ok(evenementRepository.findByOrderByDateDebutDesc());
    }

    @GetMapping("/public/upcoming")
    public ResponseEntity<List<Evenement>> getUpcoming() {
        return ResponseEntity.ok(evenementRepository.findUpcomingEvents());
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Evenement>> getAll() {
        return ResponseEntity.ok(evenementRepository.findByOrderByDateDebutDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evenement> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Événement", id)));
    }

    @GetMapping("/mes-evenements")
    @PreAuthorize("hasAnyRole('MEMBRE','ANIMATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getMesEvenements(Authentication auth) {
        User membre = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<InscriptionEvenement> inscriptions = inscriptionEvenementRepository.findByMembreId(membre.getId());

        List<Map<String, Object>> result = inscriptions.stream()
                .filter(insc -> insc.getEvenement() != null)
                .map(insc -> {
                    Map<String, Object> map = new HashMap<>();
                    Evenement ev = insc.getEvenement();
                    map.put("id", ev.getId());
                    map.put("titre", ev.getTitre());
                    map.put("titreAr", ev.getTitreAr());
                    map.put("description", ev.getDescription());
                    map.put("descriptionAr", ev.getDescriptionAr());
                    map.put("dateDebut", ev.getDateDebut());
                    map.put("dateFin", ev.getDateFin());
                    map.put("lieu", ev.getLieu());
                    map.put("prix", ev.getPrix());
                    map.put("capaciteMax", ev.getCapaciteMax());
                    map.put("statut", ev.getStatut());
                    map.put("inscriptionId", insc.getId());
                    map.put("presence", insc.getPresence());
                    map.put("montantPaye", insc.getMontantPaye());
                    map.put("statutPaiement", insc.getStatutPaiement());
                    return map;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Evenement> create(@RequestBody Evenement evenement) {
        return ResponseEntity.ok(evenementRepository.save(evenement));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Evenement> update(@PathVariable Long id, @RequestBody Evenement req) {
        Evenement ev = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Événement", id));
        if (req.getTitre() != null) ev.setTitre(req.getTitre());
        if (req.getTitreAr() != null) ev.setTitreAr(req.getTitreAr());
        if (req.getDescription() != null) ev.setDescription(req.getDescription());
        if (req.getDescriptionAr() != null) ev.setDescriptionAr(req.getDescriptionAr());
        if (req.getDateDebut() != null) ev.setDateDebut(req.getDateDebut());
        if (req.getDateFin() != null) ev.setDateFin(req.getDateFin());
        if (req.getLieu() != null) ev.setLieu(req.getLieu());
        if (req.getStatut() != null) ev.setStatut(req.getStatut());
        if (req.getCapaciteMax() != null) ev.setCapaciteMax(req.getCapaciteMax());
        if (req.getPrix() != null) ev.setPrix(req.getPrix());
        if (req.getImage() != null) ev.setImage(req.getImage());

        // ⭐ NOUVEAUX CHAMPS pour contenu riche ⭐
        if (req.getContenuHtml() != null) ev.setContenuHtml(req.getContenuHtml());
        if (req.getProgramme() != null) ev.setProgramme(req.getProgramme());
        if (req.getLieuDetaille() != null) ev.setLieuDetaille(req.getLieuDetaille());
        if (req.getHoraireDetaille() != null) ev.setHoraireDetaille(req.getHoraireDetaille());
        if (req.getGalerieImages() != null) ev.setGalerieImages(req.getGalerieImages());

        return ResponseEntity.ok(evenementRepository.save(ev));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        evenementRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Événement supprimé"));
    }

    @GetMapping("/{id}/inscriptions")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','ANIMATEUR')")
    public ResponseEntity<?> getInscriptions(@PathVariable Long id) {
        try {
            List<InscriptionEvenement> inscriptions = inscriptionEvenementRepository.findByEvenementId(id);
            List<Map<String, Object>> result = new ArrayList<>();

            for (InscriptionEvenement i : inscriptions) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", i.getId());
                map.put("presence", i.getPresence() != null && i.getPresence());
                map.put("montantPaye", i.getMontantPaye());
                map.put("statutPaiement", i.getStatutPaiement());
                map.put("dateInscription", i.getDateInscription());

                User membre = i.getMembre();
                if (membre != null) {
                    map.put("membreId", membre.getId());
                    String nomComplet = (membre.getNom() != null ? membre.getNom() : "") + " " +
                            (membre.getPrenom() != null ? membre.getPrenom() : "");
                    map.put("membreNom", nomComplet.trim().isEmpty() ? i.getMembreNom() : nomComplet);
                    map.put("membreEmail", membre.getEmail() != null ? membre.getEmail() : "");
                } else if (i.getMembreNom() != null && !i.getMembreNom().isEmpty()) {
                    map.put("membreId", null);
                    map.put("membreNom", i.getMembreNom());
                    map.put("membreEmail", "");
                } else {
                    map.put("membreId", null);
                    map.put("membreNom", "Membre inconnu");
                    map.put("membreEmail", "");
                }
                result.add(map);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/inscriptions")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','MEMBRE')")
    public ResponseEntity<?> inscrireMembre(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        try {
            Evenement evenement = evenementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

            if (evenement.getStatut() != StatutEvenement.A_VENIR) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Vous ne pouvez vous inscrire qu'aux événements à venir",
                        "statutActuel", evenement.getStatut().toString()
                ));
            }

            long inscritsCount = inscriptionEvenementRepository.countByEvenementId(id);
            if (inscritsCount >= evenement.getCapaciteMax()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cet événement a atteint sa capacité maximale",
                        "capaciteMax", evenement.getCapaciteMax(),
                        "inscrits", inscritsCount
                ));
            }

            if (body.get("membreId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "membreId est requis"));
            }
            Long membreId = Long.valueOf(body.get("membreId").toString());

            User membre = userRepository.findById(membreId)
                    .orElseThrow(() -> new RuntimeException("Membre non trouvé"));

            if (inscriptionEvenementRepository.existsByEvenementIdAndMembreId(id, membreId)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vous êtes déjà inscrit à cet événement"));
            }

            InscriptionEvenement inscription = new InscriptionEvenement();
            inscription.setEvenement(evenement);
            inscription.setMembre(membre);
            inscription.setMembreNom(membre.getPrenom() + " " + membre.getNom());
            inscription.setDateInscription(LocalDate.now());
            inscription.setStatutPaiement("EN_ATTENTE");
            inscription.setPresence(false);

            if (body.get("message") != null) {
                inscription.setMessage(body.get("message").toString());
            }

            InscriptionEvenement saved = inscriptionEvenementRepository.save(inscription);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Demande d'inscription envoyée avec succès",
                    "inscriptionId", saved.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/inscriptions/{inscriptionId}/presence")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','ANIMATEUR')")
    public ResponseEntity<?> togglePresence(
            @PathVariable Long id,
            @PathVariable Long inscriptionId,
            @RequestBody Map<String, Object> body) {

        InscriptionEvenement inscription = inscriptionEvenementRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription", inscriptionId));

        boolean present = Boolean.parseBoolean(body.get("present").toString());
        inscription.setPresence(present);
        inscriptionEvenementRepository.save(inscription);

        return ResponseEntity.ok(Map.of(
                "message", "Présence mise à jour",
                "presence", present
        ));
    }
}