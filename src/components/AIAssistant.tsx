import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConversationHistory } from './ConversationHistory';
import { ChatWindow, Message } from './ChatWindow';
import { InputBar } from './InputBar';
import { SettingsPanel } from './SettingsPanel';
import { 
  FolderOpen, 
  Search, 
  Bot,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  isPinned: boolean;
  preview: string;
  messages: Message[];
}

interface SettingsData {
  theme: 'light' | 'dark';
  aiModel: 'gemini-2.0-flash' | 'gpt-4' | 'claude-3';
  voiceEnabled: boolean;
  autoPlayAudio: boolean;
  defaultVoiceStyle: string;
  conversationRetention: string;
}

export function AIAssistant() {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'dark',
    aiModel: 'gemini-2.0-flash',
    voiceEnabled: true,
    autoPlayAudio: false,
    defaultVoiceStyle: 'professional-male',
    conversationRetention: '30-days'
  });

  // Get current conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Initialize with default conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      const defaultConversation: Conversation = {
        id: 'default',
        title: 'New Conversation',
        timestamp: new Date(),
        isPinned: false,
        preview: 'Welcome to AI Assistant',
        messages: []
      };
      setConversations([defaultConversation]);
      setActiveConversationId('default');
    }
  }, [conversations.length]);

  // Apply theme
  useEffect(() => {
    document.documentElement.className = settings.theme;
  }, [settings.theme]);

  // Message handling
  const handleSendMessage = async (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    // Add user message immediately
    updateConversationMessages(activeConversationId, [...messages, userMessage]);

    // Update message status to sent
    setTimeout(() => {
      updateConversationMessages(activeConversationId, [
        ...messages,
        { ...userMessage, status: 'sent' }
      ]);
    }, 100);

    setIsLoading(true);

    try {
      // Call AI API
      const aiResponse = await callAI(content, settings.aiModel);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      updateConversationMessages(activeConversationId, [
        ...messages,
        { ...userMessage, status: 'sent' },
        assistantMessage
      ]);

      // Update conversation preview and title if needed
      updateConversationMetadata(activeConversationId, content);

    } catch (error) {
      console.error('AI API error:', error);
      updateConversationMessages(activeConversationId, [
        ...messages,
        { ...userMessage, status: 'error' }
      ]);
      
      toast({
        title: "Failed to send message",
        description: "There was an error communicating with the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const callAI = async (message: string, model: string): Promise<string> => {
    // Here you would integrate with your chosen AI API
    // For now, we'll use the provided Gemini API key
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': 'AIzaSyCbLD6IROVx6BRS-JDfcqTnBJhoytxOuOs'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  const updateConversationMessages = (conversationId: string, newMessages: Message[]) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, messages: newMessages }
        : conv
    ));
  };

  const updateConversationMetadata = (conversationId: string, lastMessage: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            title: conv.title === 'New Conversation' ? generateTitle(lastMessage) : conv.title,
            preview: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : ''),
            timestamp: new Date()
          }
        : conv
    ));
  };

  const generateTitle = (message: string): string => {
    // Simple title generation - in a real app, you might use AI for this
    const words = message.split(' ').slice(0, 4);
    return words.join(' ') + (message.split(' ').length > 4 ? '...' : '');
  };

  // Conversation management
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      timestamp: new Date(),
      isPinned: false,
      preview: 'Start a new conversation',
      messages: []
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setIsHistoryOpen(false);

    toast({
      title: "New Conversation",
      description: "Started a new conversation",
    });
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsHistoryOpen(false);
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle } : conv
    ));
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== id);
      if (id === activeConversationId) {
        setActiveConversationId(filtered[0]?.id || null);
      }
      return filtered;
    });

    toast({
      title: "Conversation Deleted",
      description: "The conversation has been removed",
    });
  };

  const pinConversation = (id: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
  };

  // Settings management
  const handleSettingsChange = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };

  const handleExportConversations = (format: 'pdf' | 'json' | 'txt') => {
    // Implementation for exporting conversations
    console.log(`Exporting conversations as ${format}`);
  };

  const handleClearHistory = () => {
    setConversations([]);
    setActiveConversationId(null);
  };

  const handlePlayAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="lg:hidden"
          >
            {isHistoryOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="hidden lg:flex text-muted-foreground hover:text-foreground"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">AI Assistant</h1>
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all conversations..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border focus:bg-background focus:shadow-glow transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={createNewConversation}
            className="hidden sm:flex"
          >
            New Chat
          </Button>
          
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onExportConversations={handleExportConversations}
            onClearHistory={handleClearHistory}
          />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation History Sidebar */}
        <ConversationHistory
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onRenameConversation={renameConversation}
          onDeleteConversation={deleteConversation}
          onPinConversation={pinConversation}
          searchQuery={historySearchQuery}
          onSearchChange={setHistorySearchQuery}
        />

        {/* Main Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isHistoryOpen && "lg:ml-80"
        )}>
          <ChatWindow
            messages={messages}
            isTyping={isLoading}
            onPlayAudio={handlePlayAudio}
          />
          
          <InputBar
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Type your message or use voice input..."
          />
        </div>
      </div>

      {/* Mobile overlay */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}