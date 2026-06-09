package com.mellita.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String motDePasse;

    @Column(length = 20)
    private String telephone;

    @Column(length = 255)
    private String adresse;

    @Column(length = 255)
    private String photo;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "lieu_naissance", length = 100)
    private String lieuNaissance;

    @Column(name = "nom_pere", length = 100)
    private String nomPere;

    @Column(name = "nom_mere", length = 100)
    private String nomMere;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutMembre statut;

    private LocalDate dateAdhesion;

    @Column(name = "force_password_change")
    private Boolean forcePasswordChange;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "last_password_change")
    private LocalDateTime lastPasswordChange;

    @JsonIgnore
    @Column(name = "reset_token")
    private String resetToken;

    @JsonIgnore
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @JsonIgnore
    @Column(name = "login_attempts")
    private Integer loginAttempts;

    @JsonIgnore
    @Column(name = "account_locked")
    private Boolean accountLocked;

    @JsonIgnore
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateAdhesion == null) dateAdhesion = LocalDate.now();
        if (role == null) role = Role.MEMBRE;
        if (statut == null) statut = StatutMembre.ACTIF;
        if (forcePasswordChange == null) forcePasswordChange = false;
        if (loginAttempts == null) loginAttempts = 0;
        if (accountLocked == null) accountLocked = false;
    }

    @PreUpdate
    protected void onUpdate() {
        // Logique gérée dans le service
    }

    public enum StatutMembre {
        ACTIF("Actif"),
        INACTIF("Inactif"),
        EN_ATTENTE("En attente"),
        SUSPENDU("Suspendu");

        private final String libelle;

        StatutMembre(String libelle) {
            this.libelle = libelle;
        }

        public String getLibelle() {
            return libelle;
        }
    }

    // ===== Méthodes utilitaires =====

    public String getFullName() {
        return prenom + " " + nom;
    }

    public boolean isAccountNonLocked() {
        if (accountLocked == null || !accountLocked) return true;
        if (lockedUntil != null && lockedUntil.isBefore(LocalDateTime.now())) {
            accountLocked = false;
            loginAttempts = 0;
            lockedUntil = null;
            return true;
        }
        return false;
    }

    public void incrementLoginAttempts() {
        if (loginAttempts == null) loginAttempts = 0;
        loginAttempts++;
        if (loginAttempts >= 5) {
            accountLocked = true;
            lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    public void resetLoginAttempts() {
        loginAttempts = 0;
        accountLocked = false;
        lockedUntil = null;
    }

    public boolean needsPasswordChange() {
        if (Boolean.TRUE.equals(forcePasswordChange)) return true;
        if (lastPasswordChange != null) {
            return lastPasswordChange.plusDays(90).isBefore(LocalDateTime.now());
        }
        return false;
    }

    // Builder avec valeurs par défaut
    public static class UserBuilder {
        public UserBuilder withDefaults() {
            this.role = Role.MEMBRE;
            this.statut = StatutMembre.ACTIF;
            this.forcePasswordChange = false;
            this.loginAttempts = 0;
            this.accountLocked = false;
            return this;
        }
    }
}