package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle;

    @Column(nullable = false)
    private Double montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTransaction type;

    // ✅ Remplace l'enum CategorieTransaction par un simple String
    @Column(name = "categorie")
    private String categorie;

    @Column(name = "date_transaction")
    private LocalDate dateTransaction;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String reference;
    private String justificatif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    private User membre;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateTransaction == null) dateTransaction = LocalDate.now();
    }

    public enum TypeTransaction {
        RECETTE, DEPENSE
    }

    // ❌ SUPPRIME CET ENUM COMPLETEMENT :
    // public enum CategorieTransaction {
    //     COTISATION, DON, EVENEMENT, FORMATION, AUTRE
    // }
}