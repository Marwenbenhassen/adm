package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Don {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double montant;

    private String donateur;
    private String email;
    private String telephone;

    @Enumerated(EnumType.STRING)
    private StatutDon statut;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Boolean anonyme;
    private LocalDate dateDon;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "membre_id")
    private User membre;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateDon == null) dateDon = LocalDate.now();
        if (anonyme == null) anonyme = false;
        if (statut == null) statut = StatutDon.EN_ATTENTE;
    }

    public enum StatutDon {
        EN_ATTENTE, CONFIRME, ANNULE
    }
}
