package de.cookBook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.cookBook.backend.entities.Recipes;

@Repository
public interface RecipeRepository extends JpaRepository<Recipes, Long> {

    default List<Recipes> getAll() {
        return findAll();
    }

    default List<Recipes> getSixBestRated() {
        return findTop6ByOrderByRatingDesc();
    }

    default List<Recipes> getByCategoryFilter(String categoryName) {
        return findByCategoryName(categoryName);
    }

    default Recipes getRecipeById(String recipeId) {
        return findById(Long.parseLong(recipeId)).orElse(null);
    }

    List<Recipes> findTop6ByOrderByRatingDesc();
    
    List<Recipes> findByCategoryName(String categoryName);
    
} 
