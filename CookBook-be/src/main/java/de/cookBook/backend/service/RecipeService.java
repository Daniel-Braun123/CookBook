package de.cookBook.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.cookBook.backend.dto.CreateRecipeRequest;
import de.cookBook.backend.entities.*;
import de.cookBook.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientsRepository ingredientsRepository;
    private final CookingStepsRepository cookingStepsRepository;
    private final NutritionInfoRepository nutritionInfoRepository;
    private final CategorieRepository categorieRepository;
    private final ObjectMapper objectMapper;

    public RecipeService(
            RecipeRepository recipeRepository,
            IngredientsRepository ingredientsRepository,
            CookingStepsRepository cookingStepsRepository,
            NutritionInfoRepository nutritionInfoRepository,
            CategorieRepository categorieRepository,
            ObjectMapper objectMapper
    ) {
        this.recipeRepository = recipeRepository;
        this.ingredientsRepository = ingredientsRepository;
        this.cookingStepsRepository = cookingStepsRepository;
        this.nutritionInfoRepository = nutritionInfoRepository;
        this.categorieRepository = categorieRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Recipes createRecipe(CreateRecipeRequest request, Users author) {
        // Find category
        Categories category = categorieRepository.findByName(request.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryName()));

        // Create recipe
        Recipes recipe = new Recipes();
        recipe.setTitle(request.getTitle());
        recipe.setDescription(request.getDescription());
        recipe.setImage("/recipes/Recipe_Placeholder.png"); // Default placeholder
        recipe.setPrepTime(request.getPrepTime());
        recipe.setCookTime(request.getCookTime());
        recipe.setDifficulty(request.getDifficulty());
        recipe.setServings(request.getServings());
        recipe.setAuthor(author);
        recipe.setCategory(category);
        recipe.setRating(BigDecimal.ZERO);
        recipe.setReviewCount(0);
        recipe.setCreatedAt(LocalDateTime.now());

        // Convert tags to JSON
        try {
            recipe.setTags(objectMapper.writeValueAsString(request.getTags()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize tags", e);
        }

        // Save recipe first to get ID
        recipe = recipeRepository.save(recipe);

        // Create ingredients
        final Recipes savedRecipe = recipe;
        if (request.getIngredients() != null) {
            for (CreateRecipeRequest.IngredientDto ingredientDto : request.getIngredients()) {
                Ingredients ingredient = new Ingredients();
                ingredient.setRecipe(savedRecipe);
                ingredient.setName(ingredientDto.getName());
                ingredient.setAmount(BigDecimal.valueOf(ingredientDto.getAmount()));
                ingredient.setUnit(ingredientDto.getUnit());
                ingredientsRepository.save(ingredient);
            }
        }

        // Create cooking steps
        if (request.getSteps() != null) {
            for (int i = 0; i < request.getSteps().size(); i++) {
                CreateRecipeRequest.CookingStepDto stepDto = request.getSteps().get(i);
                CookingSteps step = new CookingSteps();
                step.setRecipe(savedRecipe);
                step.setStepNumber(i + 1);
                step.setInstruction(stepDto.getInstruction());
                step.setDuration(stepDto.getDuration());
                cookingStepsRepository.save(step);
            }
        }

        // Create nutrition info
        if (request.getNutrition() != null) {
            NutritionInfo nutrition = new NutritionInfo();
            nutrition.setRecipe(savedRecipe);
            nutrition.setCalories(request.getNutrition().getCalories());
            nutrition.setProtein(request.getNutrition().getProtein());
            nutrition.setCarbs(request.getNutrition().getCarbs());
            nutrition.setFat(request.getNutrition().getFat());
            nutritionInfoRepository.save(nutrition);
        }

        return savedRecipe;
    }
}
