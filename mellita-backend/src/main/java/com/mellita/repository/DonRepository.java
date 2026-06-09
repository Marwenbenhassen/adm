package com.mellita.repository;

import com.mellita.entity.Don;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonRepository extends JpaRepository<Don, Long> {
    List<Don> findByStatut(Don.StatutDon statut);
    List<Don> findByOrderByDateDonDesc();
    @Query("SELECT SUM(d.montant) FROM Don d WHERE d.statut = 'CONFIRME'")
    Double sumDonsConfirmes();
}
