package de.cookBook.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.entities.Recipes;
import de.cookBook.backend.repository.RecipeRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RequestMapping(value = "/api/recipes")
@RestController

public class RecipesController {
    private final RecipeRepository recipeRepository;


    public RecipesController (RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
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
    
    
    
}