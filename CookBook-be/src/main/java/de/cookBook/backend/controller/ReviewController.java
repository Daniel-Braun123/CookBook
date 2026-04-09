package de.cookBook.backend.controller;

import de.cookBook.backend.dto.ReviewRequestDto;
import de.cookBook.backend.dto.ReviewResponseDto;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/recipe/{recipeId}")
    public ResponseEntity<ReviewResponseDto> submitReview(
            @PathVariable Long recipeId,
            @RequestBody ReviewRequestDto request,
            @AuthenticationPrincipal Users user) {
        return ResponseEntity.ok(reviewService.submitReview(recipeId, user, request));
    }

    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviews(@PathVariable Long recipeId) {
        return ResponseEntity.ok(reviewService.getReviewsForRecipe(recipeId));
    }

    @DeleteMapping("/recipe/{recipeId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal Users user) {
        reviewService.deleteReview(recipeId, user);
        return ResponseEntity.noContent().build();
    }
}
