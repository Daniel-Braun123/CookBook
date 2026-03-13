package de.cookBook.backend.security;

import java.util.Optional;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import de.cookBook.backend.entities.AuthProvider;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        String providerId = oauth2User.getAttribute("sub");
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        
        // Find or create user
        Optional<Users> existingUser = userRepository.findByAuthProviderAndProviderId(AuthProvider.GOOGLE, providerId);
        
        Users user;
        if (existingUser.isPresent()) {
            // Update existing user
            user = existingUser.get();
            user.setName(name);
            user.setProfilePicture(picture);
        } else {
            // Create new user
            user = new Users();
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
            user.setEmail(email);
            user.setName(name);
            user.setProfilePicture(picture);
            user.setPassword(null); // OAuth users don't have passwords
        }
        
        user = userRepository.save(user);
        
        return new CustomOAuth2User(oauth2User, user);
    }
}
