import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from './VoiceInput';
import { AudioGenerator } from './AudioGenerator';
import { 
  Send, 
  Paperclip, 
  Loader2,
  CornerDownLeft,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function InputBar({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type your message..." 
}: InputBarProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, isLoading, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscription = (transcript: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + transcript);
    setIsListening(false);
    
    // Auto-focus textarea after voice input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of ~6 lines
    textarea.style.height = `${newHeight}px`;
  };

  const handleAudioGenerated = (audioUrl: string, script: string) => {
    // Add the generated audio as a message
    onSendMessage(`Generated audio script: ${script}`);
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto p-4">
        <div className="relative">
          {/* Main Input Area */}
          <div className="flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-card hover:shadow-glow transition-shadow duration-200">
            {/* Attach Button */}
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : placeholder}
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-none bg-transparent px-0 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
                  isListening && "placeholder:text-primary"
                )}
                disabled={isLoading || isListening}
                rows={1}
              />
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Voice Input */}
            <VoiceInput
              onTranscription={handleVoiceTranscription}
              isListening={isListening}
              onStartListening={() => setIsListening(true)}
              onStopListening={() => setIsListening(false)}
            />

            {/* Audio Generator */}
            <AudioGenerator onAudioGenerated={handleAudioGenerated} />

            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading || isListening}
              size="icon"
              className={cn(
                "flex-shrink-0 transition-all duration-200",
                message.trim() && !isLoading && !isListening
                  ? "bg-gradient-primary hover:scale-105 hover:shadow-glow" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="flex items-center justify-between mt-2 px-3">
            <div className="text-xs text-muted-foreground">
              {message.trim() ? (
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" />
                  Send • Shift + Enter for new line
                </span>
              ) : (
                "Start typing or use voice input to begin..."
              )}
            </div>
            
            {/* Character Counter (optional) */}
            {message.length > 500 && (
              <div className="text-xs text-muted-foreground">
                {message.length}/1000
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}