package com.mellita.controller;

import com.mellita.entity.*;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin
public class ClubController {

    @Autowired private ClubRepository clubRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PresenceRepository presenceRepository;
    @Autowired private InscriptionClubRepository inscriptionClubRepository;

    private Map<String, Object> toMap(Club club) {
        if (club == null) return new HashMap<>();

        Map<String, Object> map = new HashMap<>();
        map.put("id", club.getId());
        map.put("nom", club.getNom());
        map.put("nomAr", club.getNomAr());
        map.put("description", club.getDescription());
        map.put("tarifSeance", club.getTarifSeance());
        map.put("partAnimateur", club.getPartAnimateur());
        map.put("typePartAnimateur", club.getTypePartAnimateur() != null
                ? club.getTypePartAnimateur().name() : null);
        map.put("lieu", club.getLieu());
        map.put("horaire", club.getHoraire());
        map.put("capaciteMax", club.getCapaciteMax());
        map.put("statut", club.getStatut() != null ? club.getStatut().name() : null);
        map.put("createdAt", club.getCreatedAt());

        if (club.getAnimateur() != null) {
            map.put("animateurId", club.getAnimateur().getId());
            map.put("animateurNom", club.getAnimateur().getNom());
            map.put("animateurPrenom", club.getAnimateur().getPrenom());
            map.put("animateurEmail", club.getAnimateur().getEmail());
        }
        if (club.getCreatedBy() != null) {
            map.put("createdById", club.getCreatedBy().getId());
            map.put("createdByNom", club.getCreatedBy().getNom());
        }
        return map;
    }

    // ===== PUBLIC =====
    @GetMapping("/public")
    public ResponseEntity<List<Map<String, Object>>> getPublicClubs() {
        return ResponseEntity.ok(
                clubRepository.findByStatut(Club.StatutClub.ACTIF)
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    // ===== TOUS LES CLUBS =====
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','TRESORIER','ANIMATEUR','MEMBRE')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
                clubRepository.findAll()
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));
        return ResponseEntity.ok(toMap(club));
    }

    // ===== CLUBS DE L'ANIMATEUR CONNECTÉ =====
    @GetMapping("/mes-clubs")
    @PreAuthorize("hasRole('ANIMATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getMesClubs(Authentication auth) {
        User animateur = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(
                clubRepository.findByAnimateurId(animateur.getId())
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    // ===== MES INSCRIPTIONS CLUBS (pour membre connecté) - CORRIGÉE =====
    @GetMapping("/mes-inscriptions")
    @PreAuthorize("hasRole('MEMBRE')")
    @Transactional  // ⭐ AJOUT DE L'ANNOTATION TRANSACTIONAL
    public ResponseEntity<List<Map<String, Object>>> getMesInscriptions(Authentication auth) {
        try {
            User membre = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Membre non trouvé"));

            // ⭐ Utilisation de la nouvelle méthode avec FETCH JOIN
            List<InscriptionClub> inscriptions = inscriptionClubRepository.findByMembreIdWithClubAndAnimateur(membre.getId());

            List<Map<String, Object>> result = new ArrayList<>();

            for (InscriptionClub insc : inscriptions) {
                Club club = insc.getClub();

                if (club == null) {
                    continue;
                }

                Map<String, Object> map = toMap(club);
                // Infos inscription
                map.put("inscriptionId", insc.getId());
                map.put("nombreSeances", insc.getNombreSeances() != null ? insc.getNombreSeances() : 0);
                map.put("montantDuMois", insc.getMontantDuMois() != null ? insc.getMontantDuMois() : 0.0);
                map.put("paye", insc.getPaye() != null && insc.getPaye());

                result.add(map);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // ===== CRÉER UN CLUB =====
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Club club, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        club.setCreatedBy(user);
        Club saved = clubRepository.save(club);
        Club reloaded = clubRepository.findById(saved.getId()).orElse(saved);
        return ResponseEntity.ok(toMap(reloaded));
    }

    // ===== MODIFIER UN CLUB =====
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id, @RequestBody Club req) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));
        if (req.getNom() != null) club.setNom(req.getNom());
        if (req.getNomAr() != null) club.setNomAr(req.getNomAr());
        if (req.getDescription() != null) club.setDescription(req.getDescription());
        if (req.getTarifSeance() != null) club.setTarifSeance(req.getTarifSeance());
        if (req.getPartAnimateur() != null) club.setPartAnimateur(req.getPartAnimateur());
        if (req.getTypePartAnimateur() != null) club.setTypePartAnimateur(req.getTypePartAnimateur());
        if (req.getLieu() != null) club.setLieu(req.getLieu());
        if (req.getHoraire() != null) club.setHoraire(req.getHoraire());
        if (req.getCapaciteMax() != null) club.setCapaciteMax(req.getCapaciteMax());
        if (req.getStatut() != null) club.setStatut(req.getStatut());
        Club saved = clubRepository.save(club);
        Club reloaded = clubRepository.findById(saved.getId()).orElse(saved);
        return ResponseEntity.ok(toMap(reloaded));
    }

    // ===== AFFECTER UN ANIMATEUR =====
    @PutMapping("/{id}/animateur/{animateurId}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    @Transactional
    public ResponseEntity<Map<String, Object>> affecterAnimateur(
            @PathVariable Long id, @PathVariable Long animateurId) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));
        User animateur = userRepository.findById(animateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", animateurId));
        if (animateur.getRole() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Rôle utilisateur introuvable"));
        }
        if (animateur.getRole() != Role.ANIMATEUR) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "L'utilisateur sélectionné n'est pas un animateur"));
        }
        club.setAnimateur(animateur);
        Club saved = clubRepository.save(club);
        Club reloaded = clubRepository.findById(saved.getId()).orElse(saved);
        return ResponseEntity.ok(toMap(reloaded));
    }

    // ===== SUPPRIMER =====
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!clubRepository.existsById(id)) {
            throw new ResourceNotFoundException("Club", id);
        }
        presenceRepository.deleteByClubId(id);
        inscriptionClubRepository.deleteByClubId(id);
        clubRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Club supprimé avec succès"));
    }

    // ===== MEMBRES DU CLUB =====
    @GetMapping("/{id}/membres")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','TRESORIER','ANIMATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getMembresClub(@PathVariable Long id) {
        List<InscriptionClub> inscriptions = inscriptionClubRepository.findByClubId(id);
        List<Map<String, Object>> result = new ArrayList<>();

        for (InscriptionClub insc : inscriptions) {
            if (insc.getMembre() == null) continue;

            Map<String, Object> map = new HashMap<>();
            map.put("id", insc.getId());
            map.put("membreId", insc.getMembre().getId());
            map.put("membreNom", insc.getMembre().getNom() != null ? insc.getMembre().getNom() : "");
            map.put("membrePrenom", insc.getMembre().getPrenom() != null ? insc.getMembre().getPrenom() : "");
            map.put("membreEmail", insc.getMembre().getEmail() != null ? insc.getMembre().getEmail() : "");
            map.put("nombreSeances", insc.getNombreSeances() != null ? insc.getNombreSeances() : 0);
            map.put("montantDuMois", insc.getMontantDuMois() != null ? insc.getMontantDuMois() : 0.0);
            map.put("paye", insc.getPaye() != null && insc.getPaye());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // ===== INSCRIRE UN MEMBRE =====
    @PostMapping("/{clubId}/inscrire/{membreId}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> inscrireMembre(
            @PathVariable Long clubId, @PathVariable Long membreId) {
        if (inscriptionClubRepository.findByMembreIdAndClubId(membreId, clubId).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Membre déjà inscrit à ce club"));
        }
        User membre = userRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", membreId));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));
        InscriptionClub inscription = InscriptionClub.builder()
                .membre(membre).club(club).build();
        inscriptionClubRepository.save(inscription);
        return ResponseEntity.ok(Map.of("success", true, "message", "Membre inscrit avec succès"));
    }

    // ===== SAISIE PRÉSENCE UNITAIRE =====
    @PostMapping("/{clubId}/presences")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','ANIMATEUR')")
    public ResponseEntity<Map<String, Object>> saisirPresence(
            @PathVariable Long clubId,
            @RequestBody Presence presenceReq,
            Authentication auth) {

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));
        User animateurConnecte = userRepository.findByEmail(auth.getName()).orElseThrow();

        if (animateurConnecte.getRole() == Role.ANIMATEUR) {
            if (club.getAnimateur() == null ||
                    !club.getAnimateur().getId().equals(animateurConnecte.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        presenceReq.setClub(club);
        presenceReq.setAnimateur(animateurConnecte);

        if (Boolean.TRUE.equals(presenceReq.getPresent())) {
            presenceReq.setFraisSeance(club.getTarifSeance());
            if (club.getTypePartAnimateur() == Club.TypePartAnimateur.POURCENTAGE) {
                presenceReq.setPartAnimateurSeance(
                        club.getTarifSeance() * club.getPartAnimateur() / 100);
            } else {
                presenceReq.setPartAnimateurSeance(club.getPartAnimateur());
            }
        } else {
            presenceReq.setFraisSeance(0.0);
            presenceReq.setPartAnimateurSeance(0.0);
        }

        Presence saved = presenceRepository.save(presenceReq);

        inscriptionClubRepository.findByMembreIdAndClubId(
                presenceReq.getMembre().getId(), clubId).ifPresent(insc -> {
            if (Boolean.TRUE.equals(presenceReq.getPresent())) {
                insc.setNombreSeances(
                        (insc.getNombreSeances() == null ? 0 : insc.getNombreSeances()) + 1);
                inscriptionClubRepository.save(insc);
            }
        });

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("present", saved.getPresent());
        response.put("fraisSeance", saved.getFraisSeance());
        response.put("dateSeance", saved.getDateSeance());
        return ResponseEntity.ok(response);
    }

    // ===== PRÉSENCES D'UN CLUB =====
    @GetMapping("/{clubId}/presences")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','TRESORIER','ANIMATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getPresences(
            @PathVariable Long clubId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (user.getRole() == Role.ANIMATEUR) {
            Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));
            if (club.getAnimateur() == null ||
                    !club.getAnimateur().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        List<Map<String, Object>> result = presenceRepository.findByClubId(clubId)
                .stream().map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("membreId", p.getMembre().getId());
                    map.put("membreNom", p.getMembre().getNom() != null ? p.getMembre().getNom() : "");
                    map.put("membrePrenom", p.getMembre().getPrenom() != null ? p.getMembre().getPrenom() : "");
                    map.put("present", p.getPresent());
                    map.put("dateSeance", p.getDateSeance());
                    map.put("fraisSeance", p.getFraisSeance());
                    map.put("statut", p.getStatut());
                    map.put("commentaire", p.getCommentaire());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ===== RÉMUNÉRATION ANIMATEUR =====
    @GetMapping("/ma-remuneration")
    @PreAuthorize("hasRole('ANIMATEUR')")
    public ResponseEntity<Map<String, Object>> getMaRemuneration(Authentication auth) {
        User animateur = userRepository.findByEmail(auth.getName()).orElseThrow();
        Double total = presenceRepository.sumPartAnimateur(animateur.getId());
        List<Presence> presences = presenceRepository.findByAnimateurId(animateur.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("remunerationTotale", total != null ? total : 0.0);
        result.put("nombreSeances", presences.size());
        result.put("clubs", clubRepository.findByAnimateurId(animateur.getId())
                .stream().map(this::toMap).collect(Collectors.toList()));
        return ResponseEntity.ok(result);
    }

    // ===== PRÉSENCES PAR DATE =====
    @GetMapping("/{clubId}/presences/date")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','ANIMATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getPresencesByDate(
            @PathVariable Long clubId,
            @RequestParam String date,
            Authentication auth) {

        LocalDate dateSeance = LocalDate.parse(date);
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        if (currentUser.getRole() == Role.ANIMATEUR) {
            Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));
            if (club.getAnimateur() == null ||
                    !club.getAnimateur().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        List<Map<String, Object>> result = presenceRepository
                .findByClubIdAndDateSeance(clubId, dateSeance).stream().map(p -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("presenceId", p.getId());
                    item.put("membreId", p.getMembre().getId());
                    item.put("prenom", p.getMembre().getPrenom() != null ? p.getMembre().getPrenom() : "");
                    item.put("nom", p.getMembre().getNom() != null ? p.getMembre().getNom() : "");
                    item.put("email", p.getMembre().getEmail() != null ? p.getMembre().getEmail() : "");
                    item.put("present", p.getPresent());
                    item.put("statut", p.getStatut() != null ? p.getStatut() : "EN_ATTENTE");
                    item.put("fraisSeance", p.getFraisSeance());
                    item.put("commentaire", p.getCommentaire());
                    return item;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ===== PRÉSENCES BATCH =====
    @PostMapping("/{clubId}/presences/batch")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','ANIMATEUR')")
    public ResponseEntity<Map<String, Object>> saisirPresenceBatch(
            @PathVariable Long clubId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        if (currentUser.getRole() == Role.ANIMATEUR) {
            if (club.getAnimateur() == null ||
                    !club.getAnimateur().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        Object dateObj = body.get("dateSeance") != null
                ? body.get("dateSeance") : body.get("date");
        LocalDate dateSeance = LocalDate.parse(dateObj.toString());
        List<Map<String, Object>> membres =
                (List<Map<String, Object>>) body.get("presences");

        for (Map<String, Object> m : membres) {
            Long membreId = Long.parseLong(m.get("membreId").toString());
            Boolean present = (Boolean) m.get("present");
            String commentaire = m.get("commentaire") != null
                    ? m.get("commentaire").toString() : null;

            User membre = userRepository.findById(membreId).orElseThrow();
            Presence presence = presenceRepository
                    .findByClubIdAndMembreIdAndDateSeance(clubId, membreId, dateSeance)
                    .orElse(new Presence());

            boolean isNew = (presence.getId() == null);
            presence.setClub(club);
            presence.setMembre(membre);
            presence.setAnimateur(currentUser);
            presence.setDateSeance(dateSeance);
            presence.setPresent(present);
            presence.setFraisSeance(
                    present ? (club.getTarifSeance() != null ? club.getTarifSeance() : 0.0) : 0.0);
            presence.setCommentaire(commentaire);
            presence.setStatut("EN_ATTENTE");
            presenceRepository.save(presence);

            if (isNew && Boolean.TRUE.equals(present)) {
                inscriptionClubRepository.findByMembreIdAndClubId(membreId, clubId)
                        .ifPresent(insc -> {
                            insc.setNombreSeances(
                                    (insc.getNombreSeances() == null ? 0 : insc.getNombreSeances()) + 1);
                            double montant = insc.getNombreSeances() *
                                    (club.getTarifSeance() != null ? club.getTarifSeance() : 0.0);
                            insc.setMontantDuMois(montant);
                            insc.setPaye(false);
                            inscriptionClubRepository.save(insc);
                        });
            }
        }

        return ResponseEntity.ok(Map.of("success", true,
                "message", "Présences enregistrées avec succès"));
    }

    // ===== CALCUL FRAIS MENSUELS =====
    @PostMapping("/{clubId}/calculer-frais-mensuels")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> calculerFraisMensuels(@PathVariable Long clubId) {
        List<InscriptionClub> inscriptions = inscriptionClubRepository.findByClubId(clubId);
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));

        for (InscriptionClub insc : inscriptions) {
            Long nbPresences = presenceRepository.countPresencesByMembreAndClub(
                    insc.getMembre().getId(), clubId);
            double montant = nbPresences *
                    (club.getTarifSeance() != null ? club.getTarifSeance() : 0.0);
            insc.setNombreSeances(nbPresences != null ? nbPresences.intValue() : 0);
            insc.setMontantDuMois(montant);
            insc.setPaye(false);
        }
        inscriptionClubRepository.saveAll(inscriptions);
        return ResponseEntity.ok(Map.of("success", true,
                "message", "Frais mensuels calculés avec succès"));
    }

    // ===== STATISTIQUES GLOBALES =====
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','TRESORIER')")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClubs", clubRepository.count());
        stats.put("clubsActifs",
                clubRepository.findByStatut(Club.StatutClub.ACTIF).size());
        stats.put("totalPresences", presenceRepository.count());
        stats.put("totalInscriptions", inscriptionClubRepository.count());
        return ResponseEntity.ok(stats);
    }

    // ===== STATISTIQUES D'UN CLUB =====
    @GetMapping("/{clubId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','ANIMATEUR')")
    public ResponseEntity<Map<String, Object>> getClubStats(@PathVariable Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));

        long totalMembres = inscriptionClubRepository.countByClubId(clubId);
        Long totalSeances = presenceRepository.countDistinctSeancesByClubId(clubId);
        Long totalPresences = presenceRepository.countPresentByClubId(clubId);
        Double totalFrais = presenceRepository.sumFraisByClubId(clubId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("clubId", clubId);
        stats.put("clubNom", club.getNom());
        stats.put("totalMembres", totalMembres);
        stats.put("totalSeances", totalSeances != null ? totalSeances : 0);
        stats.put("totalPresences", totalPresences != null ? totalPresences : 0);
        stats.put("totalFrais", totalFrais != null ? totalFrais : 0);
        stats.put("tarifSeance", club.getTarifSeance());
        return ResponseEntity.ok(stats);
    }
}