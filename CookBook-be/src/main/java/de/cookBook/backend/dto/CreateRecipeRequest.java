package de.cookBook.backend.dto;

import de.cookBook.backend.enums.Difficulty;
import lombok.Data;

import java.util.List;

@Data
public class CreateRecipeRequest {
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

    @Data
    public static class IngredientDto {
        private String name;
        private Double amount;
        private String unit;
    }

    @Data
    public static class CookingStepDto {
        private String instruction;
        private Integer duration;
    }

    @Data
    public static class NutritionDto {
        private Integer calories;
        private Integer protein;
        private Integer carbs;
        private Integer fat;
    }
}
