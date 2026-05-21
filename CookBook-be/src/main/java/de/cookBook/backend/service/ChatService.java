package de.cookBook.backend.service;

import de.cookBook.backend.dto.ChatMessageDto;
import de.cookBook.backend.entities.Recipes;
import de.cookBook.backend.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final WebClient webClient;
    private final String model;
    private final RecipeRepository recipeRepository;
    private String systemPrompt;

    public ChatService(
            @Value("${chat.api.url}") String apiUrl,
            @Value("${chat.api.model}") String model,
            RecipeRepository recipeRepository) {
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
        this.model = model;
        this.recipeRepository = recipeRepository;
    }

    @PostConstruct
    public void init() throws IOException {
        ClassPathResource resource = new ClassPathResource("chat-system-prompt.txt");
        this.systemPrompt = resource.getContentAsString(StandardCharsets.UTF_8);
    }

    public void streamChat(List<ChatMessageDto> userMessages, SseEmitter emitter) {
        try {
            String lastUserMessage = getLastUserMessage(userMessages);
            List<Recipes> matchingRecipes = searchRecipes(lastUserMessage);

            List<Map<String, String>> allMessages = buildMessages(userMessages, matchingRecipes);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", allMessages);
            requestBody.put("stream", true);

            log.info("Sending chat request with {} messages, {} matching recipes", allMessages.size(), matchingRecipes.size());

            webClient.post()
                    .uri("/v1/chat/completions")
                    .header("Content-Type", "application/json")
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToFlux(String.class)
                    .doOnNext(chunk -> {
                        try {
                            if ("[DONE]".equals(chunk.trim())) return;
                            emitter.send(SseEmitter.event().data(chunk));
                        } catch (Exception e) {
                            log.error("Error sending SSE chunk", e);
                            emitter.completeWithError(e);
                        }
                    })
                    .doOnComplete(() -> {
                        try {
                            emitter.send(SseEmitter.event().data("[DONE]"));
                            emitter.complete();
                        } catch (Exception e) {
                            log.error("Error completing SSE", e);
                            emitter.completeWithError(e);
                        }
                    })
                    .doOnError(error -> {
                        log.error("Error from Copilot API", error);
                        emitter.completeWithError(error);
                    })
                    .subscribe();
        } catch (Exception e) {
            log.error("Error in streamChat", e);
            emitter.completeWithError(e);
        }
    }

    private String getLastUserMessage(List<ChatMessageDto> messages) {
        for (int i = messages.size() - 1; i >= 0; i--) {
            if ("user".equals(messages.get(i).getRole())) {
                return messages.get(i).getContent();
            }
        }
        return "";
    }

    private List<Recipes> searchRecipes(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        List<Recipes> results = new ArrayList<>();

        // Search with full query
        results.addAll(recipeRepository.searchFullText(query));

        // Also search individual words (>= 3 chars) for broader matches
        String[] words = query.split("\\s+");
        for (String word : words) {
            if (word.length() >= 3) {
                for (Recipes r : recipeRepository.searchFullText(word)) {
                    if (results.stream().noneMatch(existing -> existing.getId().equals(r.getId()))) {
                        results.add(r);
                    }
                }
            }
        }

        // Limit to 10 results
        return results.stream().limit(10).collect(Collectors.toList());
    }

    private String buildRecipeContext(List<Recipes> recipes) {
        if (recipes.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("\n\n--- Gefundene Rezepte aus unserer Datenbank ---\n");
        for (Recipes r : recipes) {
            String image = r.getImage() != null ? r.getImage() : "";
            sb.append(String.format("- [%s](/recipe/%d|%s)", r.getTitle(), r.getId(), image));
            if (r.getCategory() != null) {
                sb.append(String.format(" | Kategorie: %s", r.getCategory().getName()));
            }
            if (r.getDescription() != null) {
                String desc = r.getDescription();
                if (desc.length() > 100) {
                    desc = desc.substring(0, 100) + "...";
                }
                sb.append(String.format(" | %s", desc));
            }
            sb.append("\n");
        }
        sb.append("---\nVerlinke passende Rezepte mit dem Format [Rezeptname](/recipe/ID|bildpfad). Verwende immer exakt den Bildpfad aus der obigen Liste.");
        return sb.toString();
    }

    private List<Map<String, String>> buildMessages(List<ChatMessageDto> userMessages, List<Recipes> recipes) {
        List<Map<String, String>> messages = new ArrayList<>();

        String fullSystemPrompt = systemPrompt + buildRecipeContext(recipes);

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", fullSystemPrompt);
        messages.add(systemMsg);

        for (ChatMessageDto msg : userMessages) {
            Map<String, String> m = new HashMap<>();
            m.put("role", msg.getRole());
            m.put("content", msg.getContent());
            messages.add(m);
        }

        return messages;
    }
}
