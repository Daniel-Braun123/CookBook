package de.cookBook.backend.repository;

import de.cookBook.backend.entities.SavedRecipes;
import de.cookBook.backend.entities.Recipes;
import de.cookBook.backend.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedRecipesRepository extends JpaRepository<SavedRecipes, Long> {
    
    // Check if user has saved a specific recipe
    boolean existsByUserAndRecipe(Users user, Recipes recipe);
    
    // Find saved recipe entry by user and recipe
    Optional<SavedRecipes> findByUserAndRecipe(Users user, Recipes recipe);
    
    // Get all recipe IDs saved by a user
    @Query("SELECT sr.recipe.id FROM SavedRecipes sr WHERE sr.user.id = :userId")
    List<Long> findRecipeIdsByUserId(@Param("userId") Long userId);
    
    // Get all saved recipes for a user (with full recipe data)
    @Query("SELECT sr.recipe FROM SavedRecipes sr WHERE sr.user.id = :userId ORDER BY sr.id DESC")
    List<Recipes> findRecipesByUserId(@Param("userId") Long userId);
    
    // Count saved recipes for a user
    long countByUser(Users user);
    
    // Delete by user and recipe
    void deleteByUserAndRecipe(Users user, Recipes recipe);
}
