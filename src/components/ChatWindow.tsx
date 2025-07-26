import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Copy, 
  Volume2, 
  Bot, 
  User, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  hasAudio?: boolean;
  audioUrl?: string;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  onPlayAudio?: (audioUrl: string) => void;
}

export function ChatWindow({ messages, isTyping, onPlayAudio }: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        return (
          <pre key={index} className="bg-muted p-3 rounded-lg text-sm overflow-x-auto my-2">
            <code>{line.slice(3)}</code>
          </pre>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-primary">•</span>
            <span>{line.replace(/^[•\-]\s*/, '')}</span>
          </div>
        );
      }
      
      // Bold text
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return (
        <p key={index} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
              <p className="text-muted-foreground">
                Start a conversation by typing a message below or use voice input.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={() => copyToClipboard(message.content)}
                onPlayAudio={onPlayAudio}
                formatContent={formatMessageContent}
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex items-start gap-3 animate-fade-in">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-2xl p-4 max-w-md shadow-card">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  onCopy: () => void;
  onPlayAudio?: (audioUrl: string) => void;
  formatContent: (content: string) => React.ReactNode;
}

function MessageBubble({ message, onCopy, onPlayAudio, formatContent }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={cn(
      "flex items-start gap-3 group animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8 border-2 border-primary/20">
        <AvatarFallback className={cn(
          "text-xs",
          isUser 
            ? "bg-secondary text-secondary-foreground" 
            : "bg-gradient-primary text-primary-foreground"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "max-w-[70%] relative",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl p-4 shadow-card border transition-all duration-200",
          isUser 
            ? "bg-gradient-primary text-primary-foreground border-primary/20" 
            : "bg-card text-card-foreground border-border hover:shadow-glow"
        )}>
          <div className="text-sm leading-relaxed">
            {formatContent(message.content)}
          </div>
          
          {/* Message status indicator for user messages */}
          {isUser && message.status && (
            <div className="flex items-center gap-1 mt-2 opacity-70">
              {message.status === 'sending' && <Loader2 className="h-3 w-3 animate-spin" />}
              {message.status === 'sent' && <CheckCircle2 className="h-3 w-3" />}
              {message.status === 'error' && <AlertCircle className="h-3 w-3 text-destructive" />}
              <span className="text-xs capitalize">{message.status}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCopy}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          {message.hasAudio && message.audioUrl && onPlayAudio && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPlayAudio(message.audioUrl!)}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <Volume2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}