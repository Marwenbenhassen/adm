package com.mellita.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clubs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String nomAr;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double tarifSeance;
    private Double partAnimateur;

    @Enumerated(EnumType.STRING)
    private TypePartAnimateur typePartAnimateur;

    private String lieu;
    private String horaire;
    private Integer capaciteMax;

    @Enumerated(EnumType.STRING)
    private StatutClub statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animateur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler",
            "motDePasse", "resetToken", "resetTokenExpiry",
            "loginAttempts", "accountLocked", "lockedUntil"})
    private User animateur;

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
        if (statut == null) statut = StatutClub.ACTIF;
        if (typePartAnimateur == null) typePartAnimateur = TypePartAnimateur.FIXE;
    }

    public enum StatutClub {
        ACTIF, INACTIF, SUSPENDU
    }

    public enum TypePartAnimateur {
        FIXE,
        POURCENTAGE
    }
}