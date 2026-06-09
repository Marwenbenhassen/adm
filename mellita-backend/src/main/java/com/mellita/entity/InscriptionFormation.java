package com.mellita.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "inscriptions_formations",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"formation_id", "membre_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class InscriptionFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // RELATION FORMATION
    // =========================
    // ⭐ UNIQUE MODIFICATION : LAZY → EAGER ⭐
    @ManyToOne(fetch = FetchType.EAGER)  // ← Seul changement ici
    @JoinColumn(name = "formation_id", nullable = false)
    private Formation formation;

    // =========================
    // RELATION MEMBRE
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id", nullable = false)
    private User membre;

    @Column(name = "membre_nom")
    private String membreNom;

    @Column(name = "date_inscription", nullable = false)
    private LocalDate dateInscription;

    @Column(name = "montant_paye")
    private Double montantPaye;

    @Column(name = "statut_paiement")
    private String statutPaiement;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @Column(name = "presence")
    @Builder.Default
    private Boolean presence = null;

    @Column(name = "certificat_delivre")
    @Builder.Default
    private Boolean certificatDelivre = false;

    @Column(name = "note")
    private Integer note;

    @Column(name = "motivation", length = 1000)
    private String motivation;

    @Column(name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateInscription == null) {
            dateInscription = LocalDate.now();
        }
        if (statutPaiement == null) {
            statutPaiement = "EN_ATTENTE";
        }
        if (certificatDelivre == null) {
            certificatDelivre = false;
        }
        if (presence == null) {
            presence = true;
        }
        if (membreNom == null && membre != null && membre.getNom() != null) {
            this.membreNom = membre.getNom();
        } else if (membreNom == null && membre != null && membre.getEmail() != null) {
            this.membreNom = membre.getEmail().split("@")[0];
        } else if (membreNom == null) {
            this.membreNom = "Membre_" + System.currentTimeMillis();
        }
    }

    public void marquerCommePaye() {
        this.statutPaiement = "PAYE";
        this.datePaiement = LocalDate.now();
    }

    public void marquerCommeAnnule() {
        this.statutPaiement = "ANNULE";
    }

    public void delivrerCertificat() {
        this.certificatDelivre = true;
    }

    public void attribuerNote(Integer note) {
        this.note = note;
    }

    public void marquerPresent() {
        this.presence = true;
    }

    public void marquerAbsent() {
        this.presence = false;
    }
}