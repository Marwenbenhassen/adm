package com.mellita.ged.enums;

public enum DocumentStatus {
    ACTIVE("Actif"),
    ARCHIVED("Archivé");

    private final String label;

    DocumentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}