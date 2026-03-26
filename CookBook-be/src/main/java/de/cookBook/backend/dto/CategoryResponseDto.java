package de.cookBook.backend.dto;

import de.cookBook.backend.entities.Categories;
import lombok.Data;

@Data
public class CategoryResponseDto {
    private Long id;
    private String name;
    private String icon;
    private Integer count;

    public static CategoryResponseDto fromEntity(Categories category) {
        CategoryResponseDto dto = new CategoryResponseDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setIcon(category.getIcon());
        dto.setCount(category.getCount());
        return dto;
    }
}
