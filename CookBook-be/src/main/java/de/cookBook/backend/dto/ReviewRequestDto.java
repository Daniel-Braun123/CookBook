package de.cookBook.backend.dto;

import lombok.Data;

@Data
public class ReviewRequestDto {
    private Integer stars;
    private String comment;
}
