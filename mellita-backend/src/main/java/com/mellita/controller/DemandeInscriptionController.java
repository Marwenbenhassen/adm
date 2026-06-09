package com.mellita.controller;

import com.mellita.entity.DemandeInscription;
import com.mellita.entity.Role;
import com.mellita.entity.User;
import com.mellita.repository.DemandeInscriptionRepository;
import com.mellita.repository.UserRepository;
import com.mellita.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/demandes-inscription")
@CrossOrigin
public class DemandeInscriptionController {

    @Autowired private DemandeInscriptionRepository demandeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;

    /** Soumettre une demande d'inscription (PUBLIC) */
    @PostMapping("/public")
    public ResponseEntity<?> soumettreDemande(@RequestBody DemandeInscription demande) {
        // Vérifier si email déjà utilisé
        if (userRepository.existsByEmail(demande.getEmail()) ||
            demandeRepository.existsByEmail(demande.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cet email est déjà utilisé"));
        }

        demande.setStatut(DemandeInscription.StatutDemande.EN_ATTENTE);
        demandeRepository.save(demande);

        return ResponseEntity.ok(Map.of(
            "message", "Votre demande d'inscription a été envoyée avec succès. Vous recevrez un email une fois votre compte validé par l'administrateur.",
            "id", demande.getId()
        ));
    }

    /** Lister toutes les demandes (ADMIN/ADMINISTRATIF) */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<List<DemandeInscription>> getAll() {
        return ResponseEntity.ok(demandeRepository.findAll());
    }

    /** Lister les demandes en attente (ADMIN/ADMINISTRATIF) */
    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<List<DemandeInscription>> getEnAttente() {
        return ResponseEntity.ok(demandeRepository.findByStatutOrderByCreatedAtDesc(
            DemandeInscription.StatutDemande.EN_ATTENTE));
    }

    /** Accepter une demande (ADMIN/ADMINISTRATIF) */
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<?> accepterDemande(@PathVariable Long id, Authentication auth) {
        DemandeInscription demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeInscription.StatutDemande.EN_ATTENTE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cette demande a déjà été traitée"));
        }

        // Générer un mot de passe temporaire
        String motDePasseTemporaire = genererMotDePasseTemporaire();

        // Créer le compte utilisateur
        User user = User.builder()
            .prenom(demande.getPrenom())
            .nom(demande.getNom())
            .email(demande.getEmail())
            .telephone(demande.getTelephone())
            .adresse(demande.getAdresse())
            .motDePasse(passwordEncoder.encode(motDePasseTemporaire))
            .role(Role.MEMBRE)
            .statut(User.StatutMembre.ACTIF)
            .forcePasswordChange(true) // Doit changer le mot de passe à la première connexion
            .build();
        userRepository.save(user);

        // Mettre à jour la demande
        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        demande.setStatut(DemandeInscription.StatutDemande.ACCEPTEE);
        demande.setMotDePasseTemporaire(motDePasseTemporaire);
        demande.setTraitePar(admin);
        demande.setDateTraitement(LocalDateTime.now());
        demandeRepository.save(demande);

        // Envoyer l'email de bienvenue
        emailService.envoyerEmailBienvenue(
            demande.getEmail(),
            demande.getPrenom(),
            demande.getNom(),
            motDePasseTemporaire
        );

        return ResponseEntity.ok(Map.of(
            "message", "Demande acceptée et email envoyé au nouveau membre",
            "userId", user.getId(),
            "motDePasseTemporaire", motDePasseTemporaire // Pour debug uniquement
        ));
    }

    /** Rejeter une demande (ADMIN/ADMINISTRATIF) */
    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<?> rejeterDemande(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        DemandeInscription demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        demande.setStatut(DemandeInscription.StatutDemande.REJETEE);
        demande.setMotifRejet(body.getOrDefault("motif", "Non précisé"));
        demande.setTraitePar(admin);
        demande.setDateTraitement(LocalDateTime.now());
        demandeRepository.save(demande);

        return ResponseEntity.ok(Map.of("message", "Demande rejetée"));
    }

    /** Statistiques (ADMIN/ADMINISTRATIF) */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
            "total", demandeRepository.count(),
            "enAttente", demandeRepository.countByStatut(DemandeInscription.StatutDemande.EN_ATTENTE),
            "acceptees", demandeRepository.countByStatut(DemandeInscription.StatutDemande.ACCEPTEE),
            "rejetees", demandeRepository.countByStatut(DemandeInscription.StatutDemande.REJETEE)
        ));
    }

    private String genererMotDePasseTemporaire() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
