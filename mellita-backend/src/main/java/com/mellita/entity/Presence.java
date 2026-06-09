package com.mellita.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "presences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Presence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "membre_id")
    @JsonIgnore
    private User membre;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    @JsonIgnore
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animateur_id")
    @JsonIgnore
    private User animateur;

    private LocalDate dateSeance;
    private Boolean present;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    private Double fraisSeance;
    private Double partAnimateurSeance;
    private String statut;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateSeance == null) dateSeance = LocalDate.now();
        if (present == null) present = true;
    }
}