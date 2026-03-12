package de.cookBook.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.cookBook.backend.entities.Categories;

@Repository
public interface CategorieRepository extends JpaRepository<Categories, Long> {

     default List<Categories> getAll() {
        return findAll();
    }
    
    Optional<Categories> findByName(String name);
    
}
