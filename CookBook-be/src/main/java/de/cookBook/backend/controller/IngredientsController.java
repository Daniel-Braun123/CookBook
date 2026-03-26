package de.cookBook.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.dto.IngredientResponseDto;
import de.cookBook.backend.repository.IngredientsRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping(value = "/api/ingridients")
@RestController
public class IngredientsController {

    private final IngredientsRepository ingredientsRepository;

    public IngredientsController(IngredientsRepository ingredientsRepository) {
        this.ingredientsRepository = ingredientsRepository;
    }

    @GetMapping("/getIngredientsWithRecipeId")
    public List<IngredientResponseDto> getIngredientsWithRecipeId(@RequestParam String recipeId) {
        return ingredientsRepository.getIngredientsWithRecipeId(recipeId)
                .stream()
                .map(IngredientResponseDto::fromEntity)
                .toList();
    }
    
}
