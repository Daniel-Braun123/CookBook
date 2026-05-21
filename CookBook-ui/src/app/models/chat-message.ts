export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListItem {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}
