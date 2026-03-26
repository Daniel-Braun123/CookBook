package de.cookBook.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.cookBook.backend.entities.Categories;
import de.cookBook.backend.repository.CategorieRepository;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;

@RequestMapping(value = "/api/categories")
@RestController
public class CategorieController {

    private final CategorieRepository categorieRepository;

    public CategorieController(CategorieRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    @GetMapping("/getAll")
    public List<Categories> getAllCategories() {
        return categorieRepository.getAll();
    }
    
}
