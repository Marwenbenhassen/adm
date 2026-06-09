package com.mellita.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "actualites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Actualite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String titreAr;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Column(columnDefinition = "TEXT")
    private String contenuAr;

    private String image;
    private String categorie;
    private Boolean publie;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "motDePasse", "resetToken", "resetTokenExpiry",
            "loginAttempts", "accountLocked", "lockedUntil"})
    private User auteur;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (publie == null) publie = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}