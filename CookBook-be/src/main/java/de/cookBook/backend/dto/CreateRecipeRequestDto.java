package de.cookBook.backend.dto;

import de.cookBook.backend.enums.Difficulty;
import lombok.Data;

import java.util.List;

@Data
public class CreateRecipeRequestDto {
    private String title;
    private String description;
    private String categoryName;
    private Difficulty difficulty;
    private Integer prepTime;
    private Integer cookTime;
    private Integer servings;
    private List<String> tags;
    private List<IngredientDto> ingredients;
    private List<CookingStepDto> steps;
    private NutritionDto nutrition;
}
