package de.cookBook.backend.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.dto.NutritionInfoResponseDto;
import de.cookBook.backend.repository.NutritionInfoRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping(value = "/api/nutritionInfo")
@RestController
public class NutritionInfoController {

    private final NutritionInfoRepository nutritionInfoRepository;

    public NutritionInfoController(NutritionInfoRepository nutritionInfoRepository) {
        this.nutritionInfoRepository = nutritionInfoRepository;
    }

    @GetMapping("/getNutritionInfoWithRecipeId")
    public NutritionInfoResponseDto getNutritionInfoWithRecipeId(@RequestParam String recipeId) {
        return NutritionInfoResponseDto.fromEntity(
                nutritionInfoRepository.getNutritionInfoWithRecipeId(recipeId)
        );
    }
    
}
