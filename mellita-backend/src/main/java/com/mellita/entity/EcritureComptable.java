package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Représente une écriture comptable (recette ou dépense).
 * Saisie par l'ADMINISTRATIF, validée par le TRÉSORIER ou l'ADMIN.
 */
@Entity
@Table(name = "ecritures_comptables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EcritureComptable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle;

    @Column(nullable = false)
    private Double montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeEcriture type; // RECETTE ou DEPENSE

    @Enumerated(EnumType.STRING)
    private CategorieEcriture categorie;

    private LocalDate dateEcriture;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String reference;
    private String justificatif;

    // ===== STATUT DE VALIDATION =====
    @Enumerated(EnumType.STRING)
    private StatutEcriture statut; // EN_ATTENTE, VALIDEE, REJETEE

    @Column(columnDefinition = "TEXT")
    private String motifRejet;

    // ===== RELATIONS =====
    @ManyToOne
    @JoinColumn(name = "membre_id")
    private User membre;

    /** Saisie par l'ADMINISTRATIF */
    @ManyToOne
    @JoinColumn(name = "saisi_par")
    private User saisiPar;

    /** Validée par le TRÉSORIER ou l'ADMIN */
    @ManyToOne
    @JoinColumn(name = "valide_par")
    private User validePar;

    private LocalDateTime dateValidation;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateEcriture == null) dateEcriture = LocalDate.now();
        if (statut == null) statut = StatutEcriture.EN_ATTENTE;
    }

    public enum TypeEcriture {
        RECETTE, DEPENSE
    }

    public enum CategorieEcriture {
        COTISATION, DON, FRAIS_CLUB, SUBVENTION, FORMATION, FOURNITURES,
        SALAIRE_ANIMATEUR, LOYER, EVENEMENT, AUTRE
    }

    public enum StatutEcriture {
        EN_ATTENTE,  // Saisie par l'ADMINISTRATIF, en attente de validation
        VALIDEE,     // Validée par le TRÉSORIER ou l'ADMIN
        REJETEE      // Rejetée avec motif
    }
}
