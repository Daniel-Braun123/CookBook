package de.cookBook.backend.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.cookBook.backend.entities.Recipes;
import de.cookBook.backend.enums.Difficulty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RecipeResponseDto {
    private Long id;
    private String title;
    private String description;
    private String image;
    private BigDecimal rating;
    private Integer reviewCount;
    private Integer prepTime;
    private Integer cookTime;
    private Difficulty difficulty;
    private Integer servings;
    private CategoryResponseDto category;
    private List<String> tags;
    private AuthorResponseDto author;
    private LocalDateTime createdAt;

    public static RecipeResponseDto fromEntity(Recipes recipe, ObjectMapper objectMapper) {
        RecipeResponseDto dto = new RecipeResponseDto();
        dto.setId(recipe.getId());
        dto.setTitle(recipe.getTitle());
        dto.setDescription(recipe.getDescription());
        dto.setImage(recipe.getImage());
        dto.setRating(recipe.getRating());
        dto.setReviewCount(recipe.getReviewCount());
        dto.setPrepTime(recipe.getPrepTime());
        dto.setCookTime(recipe.getCookTime());
        dto.setDifficulty(recipe.getDifficulty());
        dto.setServings(recipe.getServings());
        dto.setCreatedAt(recipe.getCreatedAt());

        if (recipe.getCategory() != null) {
            dto.setCategory(CategoryResponseDto.fromEntity(recipe.getCategory()));
        }

        if (recipe.getAuthor() != null) {
            dto.setAuthor(AuthorResponseDto.fromEntity(recipe.getAuthor()));
        }

        // Parse JSON tags string to List<String>
        if (recipe.getTags() != null) {
            try {
                dto.setTags(objectMapper.readValue(recipe.getTags(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                dto.setTags(List.of());
            }
        }

        return dto;
    }
}
