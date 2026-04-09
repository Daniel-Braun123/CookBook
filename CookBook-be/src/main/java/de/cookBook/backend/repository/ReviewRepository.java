package de.cookBook.backend.repository;

import de.cookBook.backend.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByRecipeIdOrderByCreatedAtDesc(Long recipeId);

    Optional<Review> findByRecipeIdAndUserId(Long recipeId, Long userId);

    boolean existsByRecipeIdAndUserId(Long recipeId, Long userId);

    @Query("SELECT COALESCE(AVG(CAST(r.stars AS double)), 0.0) FROM Review r WHERE r.recipe.id = :recipeId")
    double calculateAverageRating(@Param("recipeId") Long recipeId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.recipe.id = :recipeId")
    long countByRecipeId(@Param("recipeId") Long recipeId);
}
