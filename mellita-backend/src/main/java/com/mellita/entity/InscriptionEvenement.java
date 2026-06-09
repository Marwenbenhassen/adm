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
@Table(name = "inscriptions_evenements",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"evenement_id", "membre_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class InscriptionEvenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ UNIQUE MODIFICATION : LAZY → EAGER
    @ManyToOne(fetch = FetchType.EAGER)  // ← Changement ici uniquement
    @JoinColumn(name = "evenement_id", nullable = false)
    private Evenement evenement;

    @ManyToOne(fetch = FetchType.EAGER)
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
    private Boolean presence;

    @Column(name = "message")
    private String message;

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
        if (presence == null) {
            presence = false;
        }
        if (membreNom == null && membre != null && membre.getNom() != null) {
            membreNom = membre.getPrenom() + " " + membre.getNom();
        }
    }
}