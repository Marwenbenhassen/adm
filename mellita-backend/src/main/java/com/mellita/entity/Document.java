package com.mellita.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String description;
    private String fichier;
    private String type;
    private Long taille;

    @Enumerated(EnumType.STRING)
    private Visibilite visibilite;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (visibilite == null) visibilite = Visibilite.MEMBRES;
    }

    public enum Visibilite {
        PUBLIC, MEMBRES, ADMIN
    }
}
