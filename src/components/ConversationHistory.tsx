import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FolderOpen, 
  Search, 
  MoreVertical, 
  Pin, 
  Edit2, 
  Trash2,
  MessageSquare,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Bot,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  hasAudio?: boolean;
  audioUrl?: string;
  status?: 'sending' | 'sent' | 'error';
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  isPinned: boolean;
  preview: string;
  messages: Message[];
}

interface ConversationHistoryProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onPinConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ConversationHistory({
  isOpen,
  onToggle,
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
  searchQuery,
  onSearchChange
}: ConversationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(conv => conv.isPinned);
  const regularConversations = filteredConversations.filter(conv => !conv.isPinned);

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);
  const selectedMessages = selectedConversation?.messages || [];

  const handleSelectConversation = (id: string) => {
    if (selectedConversationId === id) {
      // If already selected, toggle to conversation list
      setSelectedConversationId(null);
    } else {
      setSelectedConversationId(id);
      setCurrentMessageIndex(0);
    }
  };

  const navigateMessage = (direction: 'up' | 'down') => {
    if (selectedMessages.length === 0) return;
    
    if (direction === 'up' && currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1);
    } else if (direction === 'down' && currentMessageIndex < selectedMessages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const formatMessageContent = (content: string) => {
    if (content.length > 200) {
      return content.substring(0, 200) + '...';
    }
    return content;
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
      isOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-sidebar-foreground" />
            <h2 className="font-semibold text-sidebar-foreground">History</h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
            />
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          {selectedConversationId && selectedConversation ? (
            /* Conversation Detail View */
            <div className="p-4">
              {/* Header with navigation */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedConversationId(null)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div>
                    <h3 className="font-medium text-sm truncate">{selectedConversation.title}</h3>
                    <p className="text-xs text-sidebar-foreground/60">
                      {selectedMessages.length} messages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigateMessage('up')}
                    disabled={currentMessageIndex === 0}
                    className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-sidebar-foreground/60 min-w-[30px] text-center">
                    {selectedMessages.length > 0 ? currentMessageIndex + 1 : 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigateMessage('down')}
                    disabled={currentMessageIndex === selectedMessages.length - 1}
                    className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Message Display */}
              {selectedMessages.length > 0 ? (
                <div className="space-y-4">
                  {/* Current Message */}
                  {selectedMessages[currentMessageIndex] && (
                    <div className="space-y-3">
                      <div className="bg-sidebar-accent/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedMessages[currentMessageIndex].type === 'user' ? (
                            <User className="h-4 w-4 text-sidebar-foreground" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs font-medium text-sidebar-foreground">
                            {selectedMessages[currentMessageIndex].type === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          <span className="text-xs text-sidebar-foreground/60 ml-auto">
                            {selectedMessages[currentMessageIndex].timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-sidebar-foreground leading-relaxed">
                          {selectedMessages[currentMessageIndex].content}
                        </p>
                      </div>
                      
                      {/* Navigation Info */}
                      <div className="flex items-center justify-between text-xs text-sidebar-foreground/60">
                        <span>Message {currentMessageIndex + 1} of {selectedMessages.length}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectConversation(selectedConversationId)}
                          className="text-xs h-6 px-2 text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Full Chat
                        </Button>
                      </div>

                      {/* Context Messages */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-sidebar-foreground/70">Recent Context:</h4>
                        {selectedMessages.slice(Math.max(0, currentMessageIndex - 2), currentMessageIndex).map((msg, idx) => (
                          <div key={msg.id} className="bg-sidebar-accent/10 rounded p-2 border-l-2 border-sidebar-accent">
                            <div className="flex items-center gap-1 mb-1">
                              {msg.type === 'user' ? (
                                <User className="h-3 w-3 text-sidebar-foreground/60" />
                              ) : (
                                <Bot className="h-3 w-3 text-primary/60" />
                              )}
                              <span className="text-xs text-sidebar-foreground/60">
                                {msg.type === 'user' ? 'You' : 'AI'}
                              </span>
                            </div>
                            <p className="text-xs text-sidebar-foreground/80">
                              {formatMessageContent(msg.content)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-sidebar-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-sidebar-foreground/60">No messages in this conversation</p>
                </div>
              )}
            </div>
          ) : (
            /* Conversations List */
            <div className="p-4">
              <div className="space-y-4">
                {/* Pinned Conversations */}
                {pinnedConversations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2 flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </h3>
                    <div className="space-y-1">
                      {pinnedConversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={conversation.id === activeConversationId}
                          isSelected={conversation.id === selectedConversationId}
                          isEditing={editingId === conversation.id}
                          editTitle={editTitle}
                          onEditTitleChange={setEditTitle}
                          onSelect={() => onSelectConversation(conversation.id)}
                          onViewDetails={() => handleSelectConversation(conversation.id)}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onDelete={() => onDeleteConversation(conversation.id)}
                          onPin={() => onPinConversation(conversation.id)}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Conversations */}
                {regularConversations.length > 0 && (
                  <div>
                    {pinnedConversations.length > 0 && (
                      <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2">Recent</h3>
                    )}
                    <div className="space-y-1">
                      {regularConversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={conversation.id === activeConversationId}
                          isSelected={conversation.id === selectedConversationId}
                          isEditing={editingId === conversation.id}
                          editTitle={editTitle}
                          onEditTitleChange={setEditTitle}
                          onSelect={() => onSelectConversation(conversation.id)}
                          onViewDetails={() => handleSelectConversation(conversation.id)}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onDelete={() => onDeleteConversation(conversation.id)}
                          onPin={() => onPinConversation(conversation.id)}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-sidebar-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-sidebar-foreground/60">
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onSelect: () => void;
  onViewDetails: () => void;
  onStartEdit: (id: string, title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  searchQuery: string;
}

function ConversationItem({
  conversation,
  isActive,
  isSelected,
  isEditing,
  editTitle,
  onEditTitleChange,
  onSelect,
  onViewDetails,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onPin,
  searchQuery
}: ConversationItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-primary/20 text-primary">{part}</span>
      ) : part
    );
  };

  return (
    <div
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-all duration-200 animate-fade-in",
        isActive 
          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
          : isSelected
          ? "bg-sidebar-accent text-sidebar-foreground border border-primary/30"
          : "hover:bg-sidebar-accent text-sidebar-foreground"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={onSaveEdit}
              className="h-6 px-0 border-none bg-transparent text-sm font-medium"
              autoFocus
            />
          ) : (
            <h4 className="text-sm font-medium truncate">
              {highlightText(conversation.title, searchQuery)}
            </h4>
          )}
          <p className="text-xs opacity-70 truncate mt-1">
            {highlightText(conversation.preview, searchQuery)}
          </p>
          <p className="text-xs opacity-50 mt-1 flex items-center gap-2">
            <span>{conversation.timestamp.toLocaleDateString()}</span>
            <span>•</span>
            <span>{conversation.messages.length} messages</span>
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {conversation.isPinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
          
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            title="View conversation history"
          >
            <Eye className="h-3 w-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(conversation.id, conversation.title);
                }}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}>
                  <Pin className="h-4 w-4 mr-2" />
                  {conversation.isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}