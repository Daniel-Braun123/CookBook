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
            Users user;

            if (authentication.getPrincipal() instanceof CustomOAuth2User customOAuth2User) {
                user = customOAuth2User.getUser();
            } else {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                user = findOrCreateUser(oauth2User);
            }

            if (user == null || user.getEmail() == null) {
                log.error("Missing user data after OAuth2 authentication");
                String errorUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/oauth2/redirect")
                    .queryParam("error", "missing_user_info")
                    .build().toUriString();
                getRedirectStrategy().sendRedirect(request, response, errorUrl);
                return;
            }

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

    private Users findOrCreateUser(OAuth2User oauth2User) {
        String providerId = oauth2User.getAttribute("sub");
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        Optional<Users> existingUser = userRepository.findByAuthProviderAndProviderId(AuthProvider.GOOGLE, providerId);

        Users user;
        if (existingUser.isPresent()) {
            user = existingUser.get();

            String existingName = user.getName();
            if ((existingName == null || existingName.isBlank()) && name != null && !name.isBlank()) {
                user.setName(name);
            }

            String existingPicture = user.getProfilePicture();
            boolean hasNoPicture = existingPicture == null || existingPicture.isBlank();
            boolean isGooglePicture = existingPicture != null && existingPicture.contains("googleusercontent.com");
            if (hasNoPicture || isGooglePicture) {
                user.setProfilePicture(picture);
            }

            log.info("Existing Google user logged in: {}", email);
        } else {
            user = new Users();
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
            user.setEmail(email);
            user.setName(name);
            user.setProfilePicture(picture);
            user.setPassword(null);
            log.info("New Google user registered: {}", email);
        }

        return userRepository.save(user);
    }
}
