package de.cookBook.backend.dto;

import lombok.Data;

@Data
public class NutritionDto {
    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fat;
}
