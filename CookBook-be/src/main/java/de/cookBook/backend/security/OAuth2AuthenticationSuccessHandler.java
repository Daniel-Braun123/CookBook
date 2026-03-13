package de.cookBook.backend.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import de.cookBook.backend.entities.AuthProvider;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.UserRepository;
import de.cookBook.backend.service.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            
            // Extract user information from OAuth2User attributes
            String providerId = oauth2User.getAttribute("sub");
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String picture = oauth2User.getAttribute("picture");
            
            if (providerId == null || email == null) {
                log.error("Missing required OAuth2 attributes. sub: {}, email: {}", providerId, email);
                String errorUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/oauth2/redirect")
                    .queryParam("error", "missing_user_info")
                    .build().toUriString();
                getRedirectStrategy().sendRedirect(request, response, errorUrl);
                return;
            }
            
            // Find or create user
            Optional<Users> existingUser = userRepository.findByAuthProviderAndProviderId(AuthProvider.GOOGLE, providerId);
            
            Users user;
            if (existingUser.isPresent()) {
                // Update existing user
                user = existingUser.get();
                user.setName(name);
                user.setProfilePicture(picture);
                log.info("Existing Google user logged in: {}", email);
            } else {
                // Create new user
                user = new Users();
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setProviderId(providerId);
                user.setEmail(email);
                user.setName(name);
                user.setProfilePicture(picture);
                user.setPassword(null); // OAuth users don't have passwords
                log.info("New Google user registered: {}", email);
            }
            
            user = userRepository.save(user);
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
            
            // Redirect to frontend with token
            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/oauth2/redirect")
                .queryParam("token", token)
                .build().toUriString();
            
            log.info("OAuth2 login successful for user: {} (ID: {})", user.getEmail(), user.getId());
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            
        } catch (Exception e) {
            log.error("Error during OAuth2 authentication success handling", e);
            String errorUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/oauth2/redirect")
                .queryParam("error", "authentication_failed")
                .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}
