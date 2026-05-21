import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChatMessage, Conversation, ConversationListItem } from '../models/chat-message';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';

interface LocalConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly STORAGE_KEY = 'cookbook-chat-conversations';
  private readonly GUEST_CHAT_KEY = 'cookbook-guest-chat';
  private chatHistory: ChatMessage[] = [];
  private currentConversationId: string | number | null = null;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  isLoggedIn(): boolean {
    return this.tokenStorage.hasToken();
  }

  // --- Conversation management ---

  getConversationList(): Observable<ConversationListItem[]> {
    if (this.isLoggedIn()) {
      return this.http.get<ConversationListItem[]>(`${environment.apiUrl}/chat/conversations`);
    }

    return new Observable(subscriber => {
      const convs = this.getLocalConversations();
      subscriber.next(convs.map(c => ({
        id: parseInt(c.id) || 0,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      })));
      subscriber.complete();
    });
  }

  createConversation(): Observable<{ id: string | number }> {
    if (this.isLoggedIn()) {
      return new Observable(subscriber => {
        this.http.post<any>(`${environment.apiUrl}/chat/conversations`, {}).subscribe({
          next: (conv) => {
            this.currentConversationId = conv.id;
            this.chatHistory = [];
            subscriber.next({ id: conv.id });
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      });
    }

    const id = Date.now().toString();
    const conv: LocalConversation = {
      id,
      title: 'Neues Gespräch',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const convs = this.getLocalConversations();
    convs.unshift(conv);
    this.saveLocalConversations(convs);
    this.currentConversationId = id;
    this.chatHistory = [];

    return new Observable(subscriber => {
      subscriber.next({ id });
      subscriber.complete();
    });
  }

  loadConversation(id: string | number): Observable<ChatMessage[]> {
    if (this.isLoggedIn()) {
      return new Observable(subscriber => {
        this.http.get<any>(`${environment.apiUrl}/chat/conversations/${id}`).subscribe({
          next: (conv) => {
            this.currentConversationId = conv.id;
            this.chatHistory = conv.messages || [];
            subscriber.next([...this.chatHistory]);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      });
    }

    const convs = this.getLocalConversations();
    const conv = convs.find(c => c.id === id.toString());
    this.currentConversationId = id;
    this.chatHistory = conv?.messages || [];

    return new Observable(subscriber => {
      subscriber.next([...this.chatHistory]);
      subscriber.complete();
    });
  }

  deleteConversation(id: string | number): Observable<void> {
    if (this.isLoggedIn()) {
      return this.http.delete<void>(`${environment.apiUrl}/chat/conversations/${id}`);
    }

    const convs = this.getLocalConversations().filter(c => c.id !== id.toString());
    this.saveLocalConversations(convs);

    if (this.currentConversationId?.toString() === id.toString()) {
      this.currentConversationId = null;
      this.chatHistory = [];
    }

    return new Observable(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  getCurrentConversationId(): string | number | null {
    return this.currentConversationId;
  }

  setCurrentConversationId(id: string | number | null): void {
    this.currentConversationId = id;
  }

  // --- Guest single chat (localStorage) ---

  loadGuestChat(): ChatMessage[] {
    try {
      const data = localStorage.getItem(this.GUEST_CHAT_KEY);
      this.chatHistory = data ? JSON.parse(data) : [];
    } catch {
      this.chatHistory = [];
    }
    return [...this.chatHistory];
  }

  private saveGuestChat(): void {
    localStorage.setItem(this.GUEST_CHAT_KEY, JSON.stringify(this.chatHistory));
  }

  // --- Message handling ---

  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearHistory(): void {
    this.chatHistory = [];
    this.currentConversationId = null;
    if (!this.isLoggedIn()) {
      localStorage.removeItem(this.GUEST_CHAT_KEY);
    }
  }

  sendMessage(userMessage: string): Observable<string> {
    this.chatHistory.push({ role: 'user', content: userMessage });

    const delta$ = new Subject<string>();

    this.streamResponse(delta$, userMessage);

    return delta$.asObservable();
  }

  private async streamResponse(delta$: Subject<string>, userMessage: string): Promise<void> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = this.tokenStorage.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${environment.apiUrl}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: this.chatHistory })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;

          const data = line.slice(5).startsWith(' ')
            ? line.slice(6)
            : line.slice(5);

          if (data === '[DONE]') continue;
          if (data.length === 0) continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content !== undefined && content !== null) {
              assistantContent += content;
              delta$.next(content);
            }
          } catch {
            // skip non-JSON chunks
          }
        }
      }

      this.chatHistory.push({ role: 'assistant', content: assistantContent });

      // Persist the message pair
      this.persistMessages(userMessage, assistantContent);

      delta$.complete();
    } catch (error) {
      delta$.error(error);
    }
  }

  private persistMessages(userMessage: string, assistantMessage: string): void {
    if (this.isLoggedIn()) {
      if (!this.currentConversationId) return;
      this.http.post(`${environment.apiUrl}/chat/conversations/${this.currentConversationId}/messages`, {
        userMessage,
        assistantMessage
      }).subscribe();
    } else {
      // Guest: save single chat to localStorage
      this.saveGuestChat();
    }
  }

  // --- LocalStorage helpers ---

  private getLocalConversations(): LocalConversation[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalConversations(convs: LocalConversation[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(convs));
  }
}
