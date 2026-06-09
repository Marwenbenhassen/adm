package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inscriptions_club",
        uniqueConstraints = @UniqueConstraint(columnNames = {"membre_id", "club_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionClub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // RELATION MEMBRE (d'abord l'ID)
    // =========================
    @ManyToOne(optional = false)
    @JoinColumn(name = "membre_id")
    private User membre;

    // =========================
    // DÉNORMALISATION - NOM MEMBRE (ajouté après l'ID)
    // =========================
    @Column(name = "membre_nom")
    private String membreNom;

    @ManyToOne(optional = false)
    @JoinColumn(name = "club_id")
    private Club club;

    private LocalDate dateInscription;

    @Enumerated(EnumType.STRING)
    private StatutInscription statut;

    private Integer nombreSeances;

    private Double montantDuMois;

    private Boolean paye;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (dateInscription == null) {
            dateInscription = LocalDate.now();
        }

        if (statut == null) {
            statut = StatutInscription.ACTIF;
        }

        if (nombreSeances == null) {
            nombreSeances = 0;
        }

        if (montantDuMois == null) {
            montantDuMois = 0.0;
        }

        if (paye == null) {
            paye = false;
        }

        // Définir le nom du membre à partir de l'entité User
        if (membreNom == null && membre != null && membre.getNom() != null) {
            this.membreNom = membre.getNom();
        } else if (membreNom == null && membre != null && membre.getEmail() != null) {
            this.membreNom = membre.getEmail().split("@")[0];
        } else if (membreNom == null) {
            this.membreNom = "Membre_" + System.currentTimeMillis();
        }
    }

    public enum StatutInscription {
        ACTIF, SUSPENDU, ANNULE
    }
}