package de.cookBook.backend.dto;

import de.cookBook.backend.entities.NutritionInfo;
import lombok.Data;

@Data
public class NutritionInfoResponseDto {
    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fat;
    private Integer fiber;

    public static NutritionInfoResponseDto fromEntity(NutritionInfo info) {
        NutritionInfoResponseDto dto = new NutritionInfoResponseDto();
        dto.setCalories(info.getCalories());
        dto.setProtein(info.getProtein());
        dto.setCarbs(info.getCarbs());
        dto.setFat(info.getFat());
        dto.setFiber(info.getFiber());
        return dto;
    }
}
