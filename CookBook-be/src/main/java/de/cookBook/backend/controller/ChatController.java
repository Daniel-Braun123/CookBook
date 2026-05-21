package de.cookBook.backend.controller;

import de.cookBook.backend.dto.ChatRequestDto;
import de.cookBook.backend.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RequestMapping("/api/chat")
@RestController
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody ChatRequestDto request) {
        SseEmitter emitter = new SseEmitter(120_000L);

        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> emitter.complete());

        chatService.streamChat(request.getMessages(), emitter);

        return emitter;
    }
}
