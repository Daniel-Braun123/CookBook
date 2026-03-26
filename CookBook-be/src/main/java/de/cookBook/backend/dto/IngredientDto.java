package de.cookBook.backend.dto;

import lombok.Data;

@Data
public class IngredientDto {
    private String name;
    private Double amount;
    private String unit;
}
