package de.cookBook.backend.repository;

import de.cookBook.backend.entities.ChatConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatConversationMessageRepository extends JpaRepository<ChatConversationMessage, Long> {
}
