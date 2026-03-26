package de.cookBook.backend.service;

import de.cookBook.backend.dto.RegisterRequestDto;
import de.cookBook.backend.dto.UpdateProfileRequestDto;
import de.cookBook.backend.entities.AuthProvider;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Users register(RegisterRequestDto request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user with hashed password
        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setProviderId(null);
        
        return userRepository.save(user);
    }

    public Users authenticate(String email, String password) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if user uses OAuth login
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new BadCredentialsException("Dieser Account nutzt Google Login");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return user;
    }

    public Users updateProfile(Long userId, UpdateProfileRequestDto request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if email is being changed and if it's already taken by another user
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setBio(request.getBio());

        // Keep existing profile picture unless a new non-empty value was provided.
        String newProfilePicture = request.getProfilePicture();
        if (newProfilePicture != null && !newProfilePicture.isBlank()) {
            user.setProfilePicture(newProfilePicture);
        }

        return userRepository.save(user);
    }
}
