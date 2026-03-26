package de.cookBook.backend.dto;

import de.cookBook.backend.entities.Ingredients;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class IngredientResponseDto {
    private Long id;
    private String name;
    private BigDecimal amount;
    private String unit;

    public static IngredientResponseDto fromEntity(Ingredients ingredient) {
        IngredientResponseDto dto = new IngredientResponseDto();
        dto.setId(ingredient.getId());
        dto.setName(ingredient.getName());
        dto.setAmount(ingredient.getAmount());
        dto.setUnit(ingredient.getUnit());
        return dto;
    }
}
