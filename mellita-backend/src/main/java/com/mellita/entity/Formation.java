package com.mellita.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String titreAr;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String descriptionAr;

    // ✅ Gardé en base pour compatibilité avec le controller (nom texte)
    private String formateur;

    // ✅ Colonne simple pour l'ID du formateur (pas @Transient)
    @Column(name = "formateur_id")
    private Long formateurId;

    // ✅ Relation ManyToOne avec l'utilisateur formateur (optionnelle pour les jointures)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formateur_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "motDePasse", "resetToken", "resetTokenExpiry",
            "loginAttempts", "accountLocked", "lockedUntil"})
    private User formateurUser;

    // ✅ Getter pour récupérer le nom du formateur depuis l'utilisateur
    public String getFormateurNom() {
        return formateurUser != null ? formateurUser.getPrenom() + " " + formateurUser.getNom() : formateur;
    }

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer dureeHeures;
    private String lieu;
    private Double prix;
    private Integer capaciteMax;

    @Column(length = 100000)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String contenuHtml;

    @Column(columnDefinition = "TEXT")
    private String programme;

    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    @Column(columnDefinition = "TEXT")
    private String objectifs;

    @Column(columnDefinition = "TEXT")
    private String publicCible;

    @Column(columnDefinition = "TEXT")
    private String certification;

    @Column(columnDefinition = "CLOB")
    private String galerieImages;

    // ⭐ SECTIONS AVEC COLONNES DE TYPE CLOB pour les images ⭐
    @Column(columnDefinition = "TEXT")
    private String section1Titre;

    @Column(columnDefinition = "TEXT")
    private String section1Texte;

    @Column(length = 100000)
    private String section1Image;

    @Column(columnDefinition = "TEXT")
    private String section2Titre;

    @Column(columnDefinition = "TEXT")
    private String section2Texte;

    @Column(length = 100000)
    private String section2Image;

    @Column(columnDefinition = "TEXT")
    private String section3Titre;

    @Column(columnDefinition = "TEXT")
    private String section3Texte;

    @Column(length = 100000)
    private String section3Image;

    @Column(columnDefinition = "TEXT")
    private String section4Titre;

    @Column(columnDefinition = "TEXT")
    private String section4Texte;

    @Column(length = 100000)
    private String section4Image;

    @Column(columnDefinition = "TEXT")
    private String section5Titre;

    @Column(columnDefinition = "TEXT")
    private String section5Texte;

    @Column(length = 100000)
    private String section5Image;

    @Column(columnDefinition = "TEXT")
    private String section6Titre;

    @Column(columnDefinition = "TEXT")
    private String section6Texte;

    @Column(length = 100000)
    private String section6Image;

    @Column(columnDefinition = "TEXT")
    private String section7Titre;

    @Column(columnDefinition = "TEXT")
    private String section7Texte;

    @Column(length = 100000)
    private String section7Image;

    @Column(columnDefinition = "TEXT")
    private String section8Titre;

    @Column(columnDefinition = "TEXT")
    private String section8Texte;

    @Column(length = 100000)
    private String section8Image;

    @Column(columnDefinition = "TEXT")
    private String section9Titre;

    @Column(columnDefinition = "TEXT")
    private String section9Texte;

    @Column(length = 100000)
    private String section9Image;

    @Column(columnDefinition = "TEXT")
    private String section10Titre;

    @Column(columnDefinition = "TEXT")
    private String section10Texte;

    @Column(length = 100000)
    private String section10Image;

    @Enumerated(EnumType.STRING)
    private StatutFormation statut;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "motDePasse", "resetToken", "resetTokenExpiry",
            "loginAttempts", "accountLocked", "lockedUntil"})
    private User createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (statut == null) statut = StatutFormation.PLANIFIEE;

        // ✅ Mettre à jour le nom texte du formateur si formateurId est présent
        if (formateurId != null && formateurUser != null) {
            this.formateur = formateurUser.getPrenom() + " " + formateurUser.getNom();
        }
    }

    @PostLoad
    protected void onLoad() {
        // ✅ Charger le nom du formateur depuis l'utilisateur si disponible
        if (formateurUser != null && (formateur == null || formateur.isEmpty())) {
            this.formateur = formateurUser.getPrenom() + " " + formateurUser.getNom();
        }
    }

    public enum StatutFormation {
        PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    }
}