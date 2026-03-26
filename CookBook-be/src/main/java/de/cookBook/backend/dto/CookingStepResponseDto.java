package de.cookBook.backend.dto;

import de.cookBook.backend.entities.CookingSteps;
import lombok.Data;

@Data
public class CookingStepResponseDto {
    private Long id;
    private Integer stepNumber;
    private String instruction;
    private String image;
    private Integer duration;

    public static CookingStepResponseDto fromEntity(CookingSteps step) {
        CookingStepResponseDto dto = new CookingStepResponseDto();
        dto.setId(step.getId());
        dto.setStepNumber(step.getStepNumber());
        dto.setInstruction(step.getInstruction());
        dto.setImage(step.getImage());
        dto.setDuration(step.getDuration());
        return dto;
    }
}
