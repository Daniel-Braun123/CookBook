package de.cookBook.backend.controller;

import de.cookBook.backend.dto.ChatMessageDto;
import de.cookBook.backend.dto.ConversationDto;
import de.cookBook.backend.dto.ConversationListItemDto;
import de.cookBook.backend.dto.SaveMessagesDto;
import de.cookBook.backend.entities.ChatConversation;
import de.cookBook.backend.entities.ChatConversationMessage;
import de.cookBook.backend.entities.Users;
import de.cookBook.backend.repository.ChatConversationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat/conversations")
public class ChatHistoryController {

    private final ChatConversationRepository conversationRepository;

    public ChatHistoryController(ChatConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    @GetMapping
    public ResponseEntity<List<ConversationListItemDto>> listConversations(@AuthenticationPrincipal Users user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ConversationListItemDto> conversations = conversationRepository
                .findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(c -> new ConversationListItemDto(c.getId(), c.getTitle(), c.getCreatedAt(), c.getUpdatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(conversations);
    }

    @PostMapping
    public ResponseEntity<ConversationDto> createConversation(@AuthenticationPrincipal Users user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ChatConversation conversation = new ChatConversation();
        conversation.setUser(user);
        conversation.setTitle("Neues Gespräch");
        conversation = conversationRepository.save(conversation);

        return ResponseEntity.ok(toDto(conversation));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDto> getConversation(
            @AuthenticationPrincipal Users user,
            @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return conversationRepository.findByIdAndUserId(id, user.getId())
                .map(c -> ResponseEntity.ok(toDto(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(
            @AuthenticationPrincipal Users user,
            @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return conversationRepository.findByIdAndUserId(id, user.getId())
                .map(c -> {
                    conversationRepository.delete(c);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ConversationDto> saveMessages(
            @AuthenticationPrincipal Users user,
            @PathVariable Long id,
            @RequestBody SaveMessagesDto dto) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return conversationRepository.findByIdAndUserId(id, user.getId())
                .map(conversation -> {
                    ChatConversationMessage userMsg = new ChatConversationMessage();
                    userMsg.setConversation(conversation);
                    userMsg.setRole("user");
                    userMsg.setContent(dto.getUserMessage());
                    conversation.getMessages().add(userMsg);

                    ChatConversationMessage assistantMsg = new ChatConversationMessage();
                    assistantMsg.setConversation(conversation);
                    assistantMsg.setRole("assistant");
                    assistantMsg.setContent(dto.getAssistantMessage());
                    conversation.getMessages().add(assistantMsg);

                    // Auto-generate title from first user message
                    if (conversation.getMessages().size() == 2) {
                        String title = dto.getUserMessage();
                        if (title.length() > 50) {
                            title = title.substring(0, 47) + "...";
                        }
                        conversation.setTitle(title);
                    }

                    conversation = conversationRepository.save(conversation);
                    return ResponseEntity.ok(toDto(conversation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private ConversationDto toDto(ChatConversation conversation) {
        List<ChatMessageDto> messages = conversation.getMessages() == null
                ? List.of()
                : conversation.getMessages().stream()
                    .map(m -> new ChatMessageDto(m.getRole(), m.getContent()))
                    .collect(Collectors.toList());

        return new ConversationDto(
                conversation.getId(),
                conversation.getTitle(),
                messages,
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }
}
