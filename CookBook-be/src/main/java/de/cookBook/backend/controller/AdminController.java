package de.cookBook.backend.controller;

import de.cookBook.backend.entities.Users;
import de.cookBook.backend.enums.Role;
import de.cookBook.backend.repository.RecipeRepository;
import de.cookBook.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    public AdminController(UserRepository userRepository, RecipeRepository recipeRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
    }

    // ── Users ────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<AdminUserDto> users = userRepository.findAll().stream()
                .map(AdminUserDto::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().body("Missing 'role' field");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + roleStr);
        }

        Users user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok(AdminUserDto.from(user));
    }

    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        } 
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Recipes ──────────────────────────────────────────────────────────

    @DeleteMapping("/delete-recipe/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        if (!recipeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        recipeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── DTO ──────────────────────────────────────────────────────────────

    public record AdminUserDto(Long id, String name, String email, String profilePicture, String role, LocalDateTime joinedAt) {
        static AdminUserDto from(Users u) {
            return new AdminUserDto(u.getId(), u.getName(), u.getEmail(), u.getProfilePicture(), u.getRole().name(), u.getJoinedAt());
        }
    }
}
