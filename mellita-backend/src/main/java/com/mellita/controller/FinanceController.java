package com.mellita.controller;

import com.mellita.entity.Transaction;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.DonRepository;
import com.mellita.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class FinanceController {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private DonRepository donRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<List<Transaction>> getAll() {
        return ResponseEntity.ok(transactionRepository.findAllOrderByDateDesc());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Transaction> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Transaction> create(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @RequestBody Transaction req) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        if (req.getLibelle() != null) t.setLibelle(req.getLibelle());
        if (req.getMontant() != null) t.setMontant(req.getMontant());
        if (req.getType() != null) t.setType(req.getType());
        if (req.getCategorie() != null) t.setCategorie(req.getCategorie());
        if (req.getDateTransaction() != null) t.setDateTransaction(req.getDateTransaction());
        if (req.getDescription() != null) t.setDescription(req.getDescription());
        return ResponseEntity.ok(transactionRepository.save(t));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        transactionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Transaction supprimée"));
    }

    @GetMapping("/bilan")
    @PreAuthorize("hasAnyRole('ADMIN','TRESORIER')")
    public ResponseEntity<Map<String, Object>> getBilan() {
        Double totalRecettes = transactionRepository.sumRecettes();
        Double totalDepenses = transactionRepository.sumDepenses();
        Double totalDons = donRepository.sumDonsConfirmes();

        totalRecettes = totalRecettes != null ? totalRecettes : 0.0;
        totalDepenses = totalDepenses != null ? totalDepenses : 0.0;
        totalDons = totalDons != null ? totalDons : 0.0;

        Map<String, Object> bilan = new HashMap<>();
        bilan.put("totalRecettes", totalRecettes);
        bilan.put("totalDepenses", totalDepenses);
        bilan.put("totalDons", totalDons);
        bilan.put("solde", totalRecettes + totalDons - totalDepenses);
        bilan.put("nbTransactions", transactionRepository.count());

        return ResponseEntity.ok(bilan);
    }
}
