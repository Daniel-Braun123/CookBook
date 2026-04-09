package de.cookBook.backend.service;

import de.cookBook.backend.dto.ReviewRequestDto;
import de.cookBook.backend.dto.ReviewResponseDto;
import de.cookBook.backend.entities.Recipes;
import de.cookBook.backend.entities.Review;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.RecipeRepository;
import de.cookBook.backend.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RecipeRepository recipeRepository;

    public ReviewService(ReviewRepository reviewRepository, RecipeRepository recipeRepository) {
        this.reviewRepository = reviewRepository;
        this.recipeRepository = recipeRepository;
    }

    @Transactional
    public ReviewResponseDto submitReview(Long recipeId, Users user, ReviewRequestDto request) {
        Recipes recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        if (recipe.getAuthor().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot review your own recipe");
        }

        if (request.getStars() == null || request.getStars() < 1 || request.getStars() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stars must be between 1 and 5");
        }

        Optional<Review> existing = reviewRepository.findByRecipeIdAndUserId(recipeId, user.getId());
        Review review;
        if (existing.isPresent()) {
            review = existing.get();
            review.setStars(request.getStars());
            review.setComment(request.getComment());
        } else {
            review = new Review();
            review.setRecipe(recipe);
            review.setUser(user);
            review.setStars(request.getStars());
            review.setComment(request.getComment());
        }

        review = reviewRepository.save(review);
        updateRecipeAggregate(recipe);
        return ReviewResponseDto.fromEntity(review);
    }

    public List<ReviewResponseDto> getReviewsForRecipe(Long recipeId) {
        return reviewRepository.findAllByRecipeIdOrderByCreatedAtDesc(recipeId)
                .stream()
                .map(ReviewResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long recipeId, Users user) {
        Review review = reviewRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        reviewRepository.delete(review);

        Recipes recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        updateRecipeAggregate(recipe);
    }

    private void updateRecipeAggregate(Recipes recipe) {
        double avg = reviewRepository.calculateAverageRating(recipe.getId());
        long count = reviewRepository.countByRecipeId(recipe.getId());
        recipe.setRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        recipe.setReviewCount((int) count);
        recipeRepository.save(recipe);
    }
}
