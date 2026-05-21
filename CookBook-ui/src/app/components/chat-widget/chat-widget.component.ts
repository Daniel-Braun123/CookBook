import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, ConversationListItem } from '../../models/chat-message';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
  animations: [
    trigger('panelAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px) scale(0.95)' }),
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in',
          style({ opacity: 0, transform: 'translateY(16px) scale(0.95)' }))
      ])
    ])
  ]
})
export class ChatWidgetComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('chatInput') private chatInputEl!: ElementRef;

  isOpen = false;
  isLoading = false;
  isStreaming = false;
  userInput = '';
  messages: ChatMessage[] = [];

  // Conversation history
  showConversationList = true;
  conversations: ConversationListItem[] = [];
  activeConversationId: string | number | null = null;

  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer
  ) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  get isLoggedIn(): boolean {
    return this.chatService.isLoggedIn();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      if (this.isLoggedIn) {
        this.loadConversationList();
      } else {
        // Guest: load single chat from localStorage directly
        this.showConversationList = false;
        this.messages = this.chatService.loadGuestChat();
        setTimeout(() => {
          this.chatInputEl?.nativeElement?.focus();
          this.scrollToBottom();
        });
      }
    }
  }

  loadConversationList(): void {
    this.chatService.getConversationList().subscribe({
      next: (list) => {
        this.conversations = list;
        // If no active conversation, show the list
        if (!this.activeConversationId) {
          this.showConversationList = true;
        }
      },
      error: () => {
        this.conversations = [];
      }
    });
  }

  openConversation(conv: ConversationListItem): void {
    this.chatService.loadConversation(conv.id).subscribe({
      next: (messages) => {
        this.activeConversationId = conv.id;
        this.messages = messages;
        this.showConversationList = false;
        this.chatService.setCurrentConversationId(conv.id);
        setTimeout(() => {
          this.scrollToBottom();
          this.chatInputEl?.nativeElement?.focus();
        });
      }
    });
  }

  deleteConversation(event: Event, conv: ConversationListItem): void {
    event.stopPropagation();
    this.chatService.deleteConversation(conv.id).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c.id !== conv.id);
        if (this.activeConversationId === conv.id) {
          this.activeConversationId = null;
          this.messages = [];
        }
      }
    });
  }

  backToList(): void {
    this.showConversationList = true;
    this.loadConversationList();
  }

  clearChat(): void {
    this.chatService.clearHistory();
    this.messages = [];
    this.activeConversationId = null;
    if (this.isLoggedIn) {
      this.showConversationList = true;
      this.loadConversationList();
    }
  }

  send(): void {
    const text = this.userInput.trim();
    if (!text || this.isStreaming) return;

    if (this.isLoggedIn && !this.activeConversationId) {
      // Logged-in: create conversation first, then switch to chat view
      this.chatService.createConversation().subscribe({
        next: (result) => {
          this.activeConversationId = result.id;
          this.messages = [];
          this.showConversationList = false;
          this.doSend(text);
        }
      });
    } else {
      this.doSend(text);
    }
  }

  private doSend(text: string): void {
    this.messages.push({ role: 'user', content: text });
    this.userInput = '';
    this.isLoading = true;
    this.isStreaming = true;
    this.shouldScroll = true;

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };

    this.chatService.sendMessage(text).subscribe({
      next: (chunk) => {
        if (this.isLoading) {
          this.isLoading = false;
          this.messages.push(assistantMsg);
        }
        assistantMsg.content += chunk;
        this.shouldScroll = true;
      },
      error: () => {
        this.isLoading = false;
        this.isStreaming = false;
        this.messages.push({
          role: 'assistant',
          content: 'Entschuldigung, der Chatbot ist momentan nicht verfügbar. Bitte versuche es später erneut.'
        });
        this.shouldScroll = true;
      },
      complete: () => {
        this.isLoading = false;
        this.isStreaming = false;
        this.shouldScroll = true;
      }
    });
  }

  renderMarkdown(text: string): SafeHtml {
    let html = this.escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Recipe links with image: [text](/recipe/ID|image_path)
    html = html.replace(/\[([^\]]+)\]\(\/recipe\/(\d+)\|([^)]*)\)/g, (_match, title, id, img) => {
      const imgSrc = this.resolveRecipeImage(img);
      return `<a href="/recipe/${id}" class="chat-recipe-card">` +
        `<img src="${imgSrc}" alt="${title}" class="chat-recipe-img" onerror="this.src='assets/recipes/Recipe_Placeholder.png'"/>` +
        `<span class="chat-recipe-title">${title}</span>` +
        `</a>`;
    });
    // Recipe links without image: [text](/recipe/ID)
    html = html.replace(/\[([^\]]+)\]\(\/recipe\/(\d+)\)/g, (_match, title, id) => {
      return `<a href="/recipe/${id}" class="chat-recipe-card">` +
        `<img src="assets/recipes/Recipe_Placeholder.png" alt="${title}" class="chat-recipe-img"/>` +
        `<span class="chat-recipe-title">${title}</span>` +
        `</a>`;
    });
    // External links
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // Unordered lists
    html = html.replace(/^[-•] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    // Clean up extra <br> inside lists
    html = html.replace(/<\/li><br>/g, '</li>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<\/pre><br>/g, '</pre>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private resolveRecipeImage(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') return 'assets/recipes/Recipe_Placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleaned = imagePath.replace(/^\/+/, '');
    return 'assets/' + cleaned;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
