package com.mellita.ged.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DocumentCategory {
    ADMINISTRATIF("Administratif"),
    FINANCIER("Financier"),
    CLUB("Club"),
    FORMATION("Formation"),
    RAPPORT("Rapport"),
    CONVENTION("Convention"),
    RESSOURCES_HUMAINES("Ressources Humaines"),
    COMMUNICATION("Communication"),
    TECHNIQUE("Technique"),
    JURIDIQUE("Juridique"),
    AUTRE("Autre");

    private final String label;

    DocumentCategory(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    public static DocumentCategory fromLabel(String label) {
        for (DocumentCategory category : values()) {
            if (category.label.equals(label)) {
                return category;
            }
        }
        return AUTRE;
    }

    @JsonCreator
    public static DocumentCategory fromString(String value) {
        if (value == null || value.isEmpty()) {
            return AUTRE;
        }

        // Essayer d'abord par le nom de l'enum
        for (DocumentCategory category : values()) {
            if (category.name().equalsIgnoreCase(value) || category.label.equalsIgnoreCase(value)) {
                return category;
            }
        }

        // Si la catégorie n'existe pas, retourner AUTRE
        // La catégorie originale sera sauvegardée dans un champ séparé si nécessaire
        System.out.println("⚠️ Catégorie dynamique reçue: " + value + " -> mappée vers AUTRE");
        return AUTRE;
    }

    // Méthode pour vérifier si une catégorie existe
    public static boolean exists(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        for (DocumentCategory category : values()) {
            if (category.name().equalsIgnoreCase(value) || category.label.equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }
}