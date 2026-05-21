package de.cookBook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    List<Recipes> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String title, String description
    );

    default List<Recipes> searchByQuery(String query) {
        return findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    @Query(value = "SELECT r.* FROM recipes r " +
           "LEFT JOIN ingredients i ON i.recipe_id = r.id " +
           "LEFT JOIN categories c ON c.id = r.category_id " +
           "WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.tags::text) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "GROUP BY r.id",
           nativeQuery = true)
    List<Recipes> searchFullText(@Param("query") String query);

} 
