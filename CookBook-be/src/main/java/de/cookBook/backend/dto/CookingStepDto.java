package de.cookBook.backend.dto;

import lombok.Data;

@Data
public class CookingStepDto {
    private String instruction;
    private Integer duration;
}
