package de.cookBook.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.cookBook.backend.dto.*;
import de.cookBook.backend.entities.*;
import de.cookBook.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientsRepository ingredientsRepository;
    private final CookingStepsRepository cookingStepsRepository;
    private final NutritionInfoRepository nutritionInfoRepository;
    private final CategorieRepository categorieRepository;
    private final SavedRecipesRepository savedRecipesRepository;
    private final ObjectMapper objectMapper;

    public RecipeService(
            RecipeRepository recipeRepository,
            IngredientsRepository ingredientsRepository,
            CookingStepsRepository cookingStepsRepository,
            NutritionInfoRepository nutritionInfoRepository,
            CategorieRepository categorieRepository,
            SavedRecipesRepository savedRecipesRepository,
            ObjectMapper objectMapper
    ) {
        this.recipeRepository = recipeRepository;
        this.ingredientsRepository = ingredientsRepository;
        this.cookingStepsRepository = cookingStepsRepository;
        this.nutritionInfoRepository = nutritionInfoRepository;
        this.categorieRepository = categorieRepository;
        this.savedRecipesRepository = savedRecipesRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RecipeResponseDto createRecipe(CreateRecipeRequestDto request, Users author) {
        // Find category
        Categories category = categorieRepository.findByName(request.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryName()));

        // Create recipe
        Recipes recipe = new Recipes();
        recipe.setTitle(request.getTitle());
        recipe.setDescription(request.getDescription());
        recipe.setImage(request.getImage() != null && !request.getImage().isBlank()
                ? request.getImage()
                : "/recipes/Recipe_Placeholder.png"); // Default placeholder
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
        if (request.getIngredients() != null) {
            for (IngredientDto ingredientDto : request.getIngredients()) {
                Ingredients ingredient = new Ingredients();
                ingredient.setRecipe(recipe);
                ingredient.setName(ingredientDto.getName());
                ingredient.setAmount(BigDecimal.valueOf(ingredientDto.getAmount()));
                ingredient.setUnit(ingredientDto.getUnit());
                ingredientsRepository.save(ingredient);
            }
        }

        // Create cooking steps
        if (request.getSteps() != null) {
            for (int i = 0; i < request.getSteps().size(); i++) {
                CookingStepDto stepDto = request.getSteps().get(i);
                CookingSteps step = new CookingSteps();
                step.setRecipe(recipe);
                step.setStepNumber(i + 1);
                step.setInstruction(stepDto.getInstruction());
                step.setDuration(stepDto.getDuration());
                cookingStepsRepository.save(step);
            }
        }

        // Create nutrition info
        if (request.getNutrition() != null) {
            NutritionInfo nutrition = new NutritionInfo();
            nutrition.setRecipe(recipe);
            nutrition.setCalories(request.getNutrition().getCalories());
            nutrition.setProtein(request.getNutrition().getProtein());
            nutrition.setCarbs(request.getNutrition().getCarbs());
            nutrition.setFat(request.getNutrition().getFat());
            nutritionInfoRepository.save(nutrition);
        }

        return RecipeResponseDto.fromEntity(recipe, objectMapper);
    }
    
    @Transactional
    public void deleteRecipe(Long recipeId, Users currentUser) {
        Recipes recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new RuntimeException("Recipe not found"));
        if (!recipe.getAuthor().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized");
        }
        recipeRepository.deleteById(recipeId);
    }

    @Transactional
    public RecipeResponseDto updateRecipe(Long recipeId, UpdateRecipeRequestDto request, Users currentUser) {
        Recipes recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        if (!recipe.getAuthor().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized");
        }

        // Update basic fields
        recipe.setTitle(request.getTitle());
        recipe.setDescription(request.getDescription());
        if (request.getImage() != null && !request.getImage().isBlank()) {
            recipe.setImage(request.getImage());
        }
        recipe.setPrepTime(request.getPrepTime());
        recipe.setCookTime(request.getCookTime());
        recipe.setDifficulty(request.getDifficulty());
        recipe.setServings(request.getServings());

        // Update category
        Categories category = categorieRepository.findByName(request.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryName()));
        recipe.setCategory(category);

        // Update tags
        try {
            recipe.setTags(objectMapper.writeValueAsString(request.getTags()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize tags", e);
        }

        recipe = recipeRepository.save(recipe);

        // Replace ingredients
        ingredientsRepository.deleteAll(ingredientsRepository.findByRecipeId(recipe.getId()));
        if (request.getIngredients() != null) {
            for (IngredientDto dto : request.getIngredients()) {
                Ingredients ingredient = new Ingredients();
                ingredient.setRecipe(recipe);
                ingredient.setName(dto.getName());
                ingredient.setAmount(java.math.BigDecimal.valueOf(dto.getAmount()));
                ingredient.setUnit(dto.getUnit());
                ingredientsRepository.save(ingredient);
            }
        }

        // Replace cooking steps
        cookingStepsRepository.deleteAll(cookingStepsRepository.findByRecipeIdOrderByStepNumberAsc(recipe.getId()));
        if (request.getSteps() != null) {
            for (int i = 0; i < request.getSteps().size(); i++) {
                CookingStepDto dto = request.getSteps().get(i);
                CookingSteps step = new CookingSteps();
                step.setRecipe(recipe);
                step.setStepNumber(i + 1);
                step.setInstruction(dto.getInstruction());
                step.setDuration(dto.getDuration());
                cookingStepsRepository.save(step);
            }
        }

        // Replace nutrition
        NutritionInfo existing = nutritionInfoRepository.findByRecipeId(recipe.getId());
        if (request.getNutrition() != null) {
            NutritionInfo nutrition = existing != null ? existing : new NutritionInfo();
            nutrition.setRecipe(recipe);
            nutrition.setCalories(request.getNutrition().getCalories());
            nutrition.setProtein(request.getNutrition().getProtein());
            nutrition.setCarbs(request.getNutrition().getCarbs());
            nutrition.setFat(request.getNutrition().getFat());
            nutritionInfoRepository.save(nutrition);
        }

        return RecipeResponseDto.fromEntity(recipe, objectMapper);
    }

    // ================== Saved Recipes Methods ==================
    
    @Transactional
    public boolean toggleSaveRecipe(Long recipeId, Users user) {
        Recipes recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        Optional<SavedRecipes> existingSaved = savedRecipesRepository.findByUserAndRecipe(user, recipe);
        
        if (existingSaved.isPresent()) {
            // Already saved, so unsave it
            savedRecipesRepository.delete(existingSaved.get());
            return false; // false = unsaved
        } else {
            // Not saved yet, so save it
            SavedRecipes savedRecipe = new SavedRecipes();
            savedRecipe.setUser(user);
            savedRecipe.setRecipe(recipe);
            savedRecipesRepository.save(savedRecipe);
            return true; // true = saved
        }
    }
    
    public boolean isRecipeSavedByUser(Long recipeId, Users user) {
        Recipes recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return savedRecipesRepository.existsByUserAndRecipe(user, recipe);
    }
    
    public List<RecipeResponseDto> getSavedRecipesByUser(Users user) {
        return savedRecipesRepository.findRecipesByUserId(user.getId())
                .stream()
                .map(recipe -> RecipeResponseDto.fromEntity(recipe, objectMapper))
                .toList();
    }
    
    public List<Long> getSavedRecipeIdsByUser(Users user) {
        return savedRecipesRepository.findRecipeIdsByUserId(user.getId());
    }

    public List<RecipeResponseDto> searchRecipes(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return toResponseList(recipeRepository.searchByQuery(query.trim()));
    }

    public RecipeResponseDto toResponse(Recipes recipe) {
        return RecipeResponseDto.fromEntity(recipe, objectMapper);
    }

    public List<RecipeResponseDto> toResponseList(List<Recipes> recipes) {
        return recipes.stream()
                .map(recipe -> RecipeResponseDto.fromEntity(recipe, objectMapper))
                .toList();
    }
}

