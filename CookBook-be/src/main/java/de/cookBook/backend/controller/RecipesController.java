package de.cookBook.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.dto.CreateRecipeRequest;
import de.cookBook.backend.entities.Recipes;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.RecipeRepository;
import de.cookBook.backend.service.RecipeService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;




@RequestMapping(value = "/api/recipes")
@RestController

public class RecipesController {
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;


    public RecipesController (RecipeRepository recipeRepository, RecipeService recipeService) {
        this.recipeRepository = recipeRepository;
        this.recipeService = recipeService;
    }

    @GetMapping("/getAll")
    public List<Recipes> getAllRecipes() {
        return recipeRepository.getAll();
    }

    @GetMapping("/getSixBestRated")
    public List<Recipes> getSixBestRatedRecipes() {
        return recipeRepository.getSixBestRated();
    }
    
    @GetMapping("/getByCategorieFilter")
    public List<Recipes> getRecipesByCategory(@RequestParam String categoryName) {
        return recipeRepository.getByCategoryFilter(categoryName);
    }

    @GetMapping("/getRecipeById")
    public Recipes getRecipeById(@RequestParam String recipeId) {
        return recipeRepository.getRecipeById(recipeId);
    }
    
    @PostMapping("/create")
    public Recipes createRecipe(
            @RequestBody CreateRecipeRequest request,
            @AuthenticationPrincipal Users currentUser
    ) {
        return recipeService.createRecipe(request, currentUser);
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
    public ResponseEntity<List<Recipes>> getSavedRecipes(
            @AuthenticationPrincipal Users currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Recipes> savedRecipes = recipeService.getSavedRecipesByUser(currentUser);
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