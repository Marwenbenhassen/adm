package com.mellita.controller;

import com.mellita.entity.Don;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.DonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ======================== DON CONTROLLER ========================
@RestController
@RequestMapping("/api/dons")
@CrossOrigin
class DonController {

    @Autowired
    private DonRepository donRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<List<Don>> getAll() {
        return ResponseEntity.ok(donRepository.findByOrderByDateDonDesc());
    }

    @PostMapping("/public")
    public ResponseEntity<Don> createPublic(@RequestBody Don don) {
        don.setStatut(Don.StatutDon.EN_ATTENTE);
        return ResponseEntity.ok(donRepository.save(don));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Don> create(@RequestBody Don don) {
        return ResponseEntity.ok(donRepository.save(don));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Don> updateStatut(@PathVariable Long id, @RequestParam Don.StatutDon statut) {
        Don don = donRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Don", id));
        don.setStatut(statut);
        return ResponseEntity.ok(donRepository.save(don));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        donRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Don supprimé"));
    }
}
