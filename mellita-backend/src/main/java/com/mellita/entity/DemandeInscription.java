package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_inscription")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeInscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    private String telephone;
    private String adresse;
    private String message; // Message optionnel du demandeur

    @Enumerated(EnumType.STRING)
    private StatutDemande statut;

    private String motifRejet; // Si rejetée
    private String motDePasseTemporaire; // Généré lors de l'acceptation

    @ManyToOne
    @JoinColumn(name = "traite_par")
    private User traitePar; // Admin qui a traité la demande

    private LocalDateTime dateTraitement;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (statut == null) statut = StatutDemande.EN_ATTENTE;
    }

    public enum StatutDemande {
        EN_ATTENTE,  // Demande envoyée, en attente de traitement
        ACCEPTEE,    // Acceptée, email envoyé avec mot de passe temporaire
        REJETEE      // Rejetée par l'admin
    }
}
