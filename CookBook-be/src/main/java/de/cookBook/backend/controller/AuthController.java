package de.cookBook.backend.controller;

import de.cookBook.backend.dto.AuthResponse;
import de.cookBook.backend.dto.LoginRequest;
import de.cookBook.backend.dto.RegisterRequest;
import de.cookBook.backend.dto.UpdateProfileRequest;
import de.cookBook.backend.dto.UserDTO;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.service.AuthService;
import de.cookBook.backend.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Users user = authService.register(request);
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
            
            UserDTO userDTO = convertToDTO(user);
            AuthResponse response = new AuthResponse(token, userDTO);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Users user = authService.authenticate(request.getEmail(), request.getPassword());
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
            
            UserDTO userDTO = convertToDTO(user);
            AuthResponse response = new AuthResponse(token, userDTO);
            
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Users user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        
        UserDTO userDTO = convertToDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal Users user,
            @RequestBody UpdateProfileRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        try {
            Users updatedUser = authService.updateProfile(user.getId(), request);
            UserDTO userDTO = convertToDTO(updatedUser);
            return ResponseEntity.ok(userDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed");
        }
    }

    private UserDTO convertToDTO(Users user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setBio(user.getBio());
        dto.setJoinedAt(user.getJoinedAt());
        return dto;
    }
}
