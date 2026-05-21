package de.cookBook.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Long id;
    private String title;
    private List<ChatMessageDto> messages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
