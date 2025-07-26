import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Moon,
  Sun,
  Bot,
  Mic,
  Download,
  Palette,
  Brain,
  Volume2,
  FileText,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SettingsData {
  theme: 'light' | 'dark';
  aiModel: 'gemini-2.0-flash' | 'gpt-4' | 'claude-3';
  voiceEnabled: boolean;
  autoPlayAudio: boolean;
  defaultVoiceStyle: string;
  conversationRetention: string;
}

interface SettingsPanelProps {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
  onExportConversations: (format: 'pdf' | 'json' | 'txt') => void;
  onClearHistory: () => void;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onExportConversations,
  onClearHistory
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSetting('theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${theme} mode`,
    });
  };

  const handleExport = (format: 'pdf' | 'json' | 'txt') => {
    onExportConversations(format);
    toast({
      title: "Export Started",
      description: `Exporting conversations as ${format.toUpperCase()}`,
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
      onClearHistory();
      toast({
        title: "History Cleared",
        description: "All conversation history has been deleted",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="flex items-center gap-2">
                  {settings.theme === 'dark' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  Theme
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun className="h-3 w-3 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon className="h-3 w-3 mr-1" />
                    Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                AI Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select
                  value={settings.aiModel}
                  onValueChange={(value: any) => updateSetting('aiModel', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.0-flash">
                      <div className="flex flex-col items-start">
                        <span>Gemini 2.0 Flash</span>
                        <span className="text-xs text-muted-foreground">Fast & efficient</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4">
                      <div className="flex flex-col items-start">
                        <span>GPT-4</span>
                        <span className="text-xs text-muted-foreground">Advanced reasoning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="claude-3">
                      <div className="flex flex-col items-start">
                        <span>Claude 3</span>
                        <span className="text-xs text-muted-foreground">Helpful & accurate</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-5 w-5" />
                Voice & Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-enabled" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Enable Voice Input
                </Label>
                <Switch
                  id="voice-enabled"
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => updateSetting('voiceEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-play">Auto-play AI Audio Responses</Label>
                <Switch
                  id="auto-play"
                  checked={settings.autoPlayAudio}
                  onCheckedChange={(checked) => updateSetting('autoPlayAudio', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="voice-style">Default Voice Style</Label>
                <Select
                  value={settings.defaultVoiceStyle}
                  onValueChange={(value) => updateSetting('defaultVoiceStyle', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional-male">Professional Male</SelectItem>
                    <SelectItem value="professional-female">Professional Female</SelectItem>
                    <SelectItem value="casual-male">Casual Male</SelectItem>
                    <SelectItem value="casual-female">Casual Female</SelectItem>
                    <SelectItem value="podcast-host">Podcast Host</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="retention">Conversation Retention</Label>
                <Select
                  value={settings.conversationRetention}
                  onValueChange={(value) => updateSetting('conversationRetention', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7-days">7 days</SelectItem>
                    <SelectItem value="30-days">30 days</SelectItem>
                    <SelectItem value="90-days">90 days</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Conversations</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('txt')}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    TXT
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearHistory}
                  className="w-full"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear All History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}