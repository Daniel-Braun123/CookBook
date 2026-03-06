package de.cookBook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.cookBook.backend.entities.NutritionInfo;

@Repository
public interface NutritionInfoRepository extends JpaRepository<NutritionInfo, Long> {

    default NutritionInfo getNutritionInfoWithRecipeId(String recipeId) {
        return findByRecipeId(Long.parseLong(recipeId));
    }

    NutritionInfo findByRecipeId(Long recipeId);
    
}
