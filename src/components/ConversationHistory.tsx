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
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  isPinned: boolean;
  preview: string;
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

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-4">
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
                      isEditing={editingId === conversation.id}
                      editTitle={editTitle}
                      onEditTitleChange={setEditTitle}
                      onSelect={() => onSelectConversation(conversation.id)}
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
                      isEditing={editingId === conversation.id}
                      editTitle={editTitle}
                      onEditTitleChange={setEditTitle}
                      onSelect={() => onSelectConversation(conversation.id)}
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
        </ScrollArea>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onSelect: () => void;
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
  isEditing,
  editTitle,
  onEditTitleChange,
  onSelect,
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
          <p className="text-xs opacity-50 mt-1">
            {conversation.timestamp.toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {conversation.isPinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
          
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