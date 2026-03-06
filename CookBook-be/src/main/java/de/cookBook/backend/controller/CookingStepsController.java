package de.cookBook.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.entities.CookingSteps;
import de.cookBook.backend.repository.CookingStepsRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RequestMapping(value = "/api/cooking-steps")
@RestController

public class CookingStepsController {
    private final CookingStepsRepository cookingStepsRepository;

    public CookingStepsController (CookingStepsRepository cookingStepsRepository) {
        this.cookingStepsRepository = cookingStepsRepository;
    }

    @GetMapping("/getCookingStepsWithRecipeId")
    public List<CookingSteps> getCookingStepsWithRecipeId(@RequestParam String recipeId) {
        return cookingStepsRepository.getCookingStepsWithRecipeId(recipeId);
    }
    
}
