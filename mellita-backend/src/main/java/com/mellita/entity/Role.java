package com.mellita.entity;

public enum Role {
    ADMIN,          // Accès total, paramétrage, logs
    ADMINISTRATIF,  // Pivot opérationnel : saisie quotidienne, gestion membres/événements/clubs
    TRESORIER,      // Contrôle et validation financière
    FORMATEUR,      // Gestion de ses propres formations
    ANIMATEUR,      // Saisie présences de son club, consultation rémunération
    MEMBRE          // Espace personnel, inscriptions, paiements
}

