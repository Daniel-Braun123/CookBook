package de.cookBook.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.dto.CreateRecipeRequestDto;
import de.cookBook.backend.dto.RecipeResponseDto;
import de.cookBook.backend.dto.UpdateRecipeRequestDto;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.RecipeRepository;
import de.cookBook.backend.service.RecipeService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping(value = "/api/recipes")
@RestController
public class RecipesController {

    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    public RecipesController(RecipeRepository recipeRepository, RecipeService recipeService) {
        this.recipeRepository = recipeRepository;
        this.recipeService = recipeService;
    }

    @GetMapping("/getAll")
    public List<RecipeResponseDto> getAllRecipes() {
        return recipeService.toResponseList(recipeRepository.getAll());
    }

    @GetMapping("/getSixBestRated")
    public List<RecipeResponseDto> getSixBestRatedRecipes() {
        return recipeService.toResponseList(recipeRepository.getSixBestRated());
    }
    
    @GetMapping("/getByCategorieFilter")
    public List<RecipeResponseDto> getRecipesByCategory(@RequestParam String categoryName) {
        return recipeService.toResponseList(recipeRepository.getByCategoryFilter(categoryName));
    }

    @GetMapping("/getRecipeById")
    public RecipeResponseDto getRecipeById(@RequestParam String recipeId) {
        return recipeService.toResponse(recipeRepository.getRecipeById(recipeId));
    }

    @GetMapping("/search")
    public List<RecipeResponseDto> searchRecipes(@RequestParam String query) {
        return recipeService.searchRecipes(query);
    }
    
    @PostMapping("/create")
    public RecipeResponseDto createRecipe(
            @RequestBody CreateRecipeRequestDto request,
            @AuthenticationPrincipal Users currentUser
    ) {
        return recipeService.createRecipe(request, currentUser);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable("id") Long id,
        @AuthenticationPrincipal Users currentUser    
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        recipeService.deleteRecipe(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RecipeResponseDto> update(
            @PathVariable("id") Long id,
            @RequestBody UpdateRecipeRequestDto request,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        RecipeResponseDto updated = recipeService.updateRecipe(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }
    
    // ================== Saved Recipes Endpoints ==================
    
    @PostMapping("/{id}/toggle-save")
    public ResponseEntity<Map<String, Boolean>> toggleSaveRecipe(
            @PathVariable Long id,
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        boolean isSaved = recipeService.toggleSaveRecipe(id, currentUser);
        return ResponseEntity.ok(Map.of("saved", isSaved));
    }
    
    @GetMapping("/saved")
    public ResponseEntity<List<RecipeResponseDto>> getSavedRecipes(
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<RecipeResponseDto> savedRecipes = recipeService.getSavedRecipesByUser(currentUser);
        return ResponseEntity.ok(savedRecipes);
    }
    
    @GetMapping("/saved-ids")
    public ResponseEntity<List<Long>> getSavedRecipeIds(
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Long> savedIds = recipeService.getSavedRecipeIdsByUser(currentUser);
        return ResponseEntity.ok(savedIds);
    }
    
}