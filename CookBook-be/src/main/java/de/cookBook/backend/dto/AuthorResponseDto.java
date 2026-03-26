package de.cookBook.backend.dto;

import de.cookBook.backend.entities.Users;
import lombok.Data;

@Data
public class AuthorResponseDto {
    private Long id;
    private String name;
    private String profilePicture;
    private String bio;

    public static AuthorResponseDto fromEntity(Users user) {
        AuthorResponseDto dto = new AuthorResponseDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setBio(user.getBio());
        return dto;
    }
}
