package com.mellita.ged.repository;

import com.mellita.ged.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Récupère toutes les catégories actives
     */
    List<Category> findByActiveTrue();

    /**
     * Récupère une catégorie par son nom (même inactive)
     */
    Optional<Category> findByName(String name);

    /**
     * Vérifie si une catégorie active existe par son nom
     */
    default boolean existsActiveByName(String name) {
        return findByName(name).map(Category::getActive).orElse(false);
    }

    /**
     * Vérifie si une catégorie existe par son nom
     */
    boolean existsByName(String name);
}