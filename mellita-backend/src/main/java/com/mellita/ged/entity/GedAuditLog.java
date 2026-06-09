package com.mellita.ged.entity;

import com.mellita.ged.enums.ActionType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ged_audit_logs")
@Data
public class GedAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long documentId;
    private String fileName;

    @Enumerated(EnumType.STRING)
    private ActionType action;

    private String performedBy;
    private LocalDateTime performedAt;
}