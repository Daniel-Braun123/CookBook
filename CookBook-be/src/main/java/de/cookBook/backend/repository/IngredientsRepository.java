package de.cookBook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.cookBook.backend.entities.Ingredients;

@Repository
public interface IngredientsRepository extends JpaRepository<Ingredients, Long> {

    default List<Ingredients> getIngredientsWithRecipeId(String recipeId) {
        return findByRecipeId(Long.parseLong(recipeId));
    }

    List<Ingredients> findByRecipeId(Long recipeId);
    
}
