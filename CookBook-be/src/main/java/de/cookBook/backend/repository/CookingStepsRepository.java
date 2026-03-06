package de.cookBook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.cookBook.backend.entities.CookingSteps;

@Repository
public interface CookingStepsRepository extends JpaRepository<CookingSteps, Long> {

    default List<CookingSteps> getCookingStepsWithRecipeId(String recipeId) {
        return findByRecipeIdOrderByStepNumberAsc(Long.parseLong(recipeId));
    }

    List<CookingSteps> findByRecipeIdOrderByStepNumberAsc(Long recipeId);
    
}