package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evenements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evenement {

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

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String lieu;
    private String image;

    // ⭐ NOUVEAUX CHAMPS POUR LE CONTENU RICHE ⭐
    @Column(columnDefinition = "TEXT")
    private String contenuHtml;

    @Column(columnDefinition = "TEXT")
    private String programme;

    @Column(columnDefinition = "TEXT")
    private String lieuDetaille;

    private String horaireDetaille;

    @Column(columnDefinition = "TEXT")
    private String galerieImages;

    // ⭐ NOUVEAUX CHAMPS POUR SECTIONS DÉTAILLÉES (TITRE + TEXTE + IMAGE) ⭐
    // Section 1
    @Column(columnDefinition = "TEXT")
    private String section1Titre;

    @Column(columnDefinition = "TEXT")
    private String section1Texte;

    private String section1Image;

    // Section 2
    @Column(columnDefinition = "TEXT")
    private String section2Titre;

    @Column(columnDefinition = "TEXT")
    private String section2Texte;

    private String section2Image;

    // Section 3
    @Column(columnDefinition = "TEXT")
    private String section3Titre;

    @Column(columnDefinition = "TEXT")
    private String section3Texte;

    private String section3Image;

    @Enumerated(EnumType.STRING)
    private StatutEvenement statut;

    private Integer capaciteMax;
    private Double prix;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (statut == null) statut = StatutEvenement.A_VENIR;
    }

    public enum StatutEvenement {
        A_VENIR, EN_COURS, TERMINE, ANNULE
    }
}