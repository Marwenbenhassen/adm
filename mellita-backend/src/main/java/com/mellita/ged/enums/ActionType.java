// src/main/java/com/mellita/ged/enums/ActionType.java
package com.mellita.ged.enums;

public enum ActionType {
    UPLOAD("Téléversement"),
    DOWNLOAD("Téléchargement"),
    ARCHIVE("Archivage"),
    RESTORE("Restauration"),
    DELETE("Suppression"),
    UPDATE("Modification");

    private final String label;

    ActionType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}