package de.cookBook.backend.dto;

import de.cookBook.backend.entities.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponseDto {

    private Long id;
    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
    private String authorName;
    private String authorProfilePicture;
    private Long authorId;

    public static ReviewResponseDto fromEntity(Review review) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId());
        dto.setStars(review.getStars());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setAuthorName(review.getUser().getName());
        dto.setAuthorProfilePicture(review.getUser().getProfilePicture());
        dto.setAuthorId(review.getUser().getId());
        return dto;
    }
}
