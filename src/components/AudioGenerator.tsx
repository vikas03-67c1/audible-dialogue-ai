import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Headphones, 
  Play, 
  Pause, 
  Download, 
  Edit, 
  Wand2,
  Volume2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AudioGeneratorProps {
  onAudioGenerated?: (audioUrl: string, script: string) => void;
}

interface GeneratedAudio {
  script: string;
  audioUrl: string;
  voiceStyle: string;
  status: 'generating' | 'completed' | 'error';
}

const voiceStyles = [
  { id: 'professional-male', name: 'Professional Male', description: 'Clear, authoritative voice' },
  { id: 'professional-female', name: 'Professional Female', description: 'Warm, confident tone' },
  { id: 'casual-male', name: 'Casual Male', description: 'Friendly, conversational' },
  { id: 'casual-female', name: 'Casual Female', description: 'Approachable, natural' },
  { id: 'podcast-host', name: 'Podcast Host', description: 'Engaging, dynamic delivery' },
  { id: 'robotic', name: 'Robotic', description: 'Synthetic, futuristic sound' },
];

export function AudioGenerator({ onAudioGenerated }: AudioGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('professional-male');
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState<HTMLAudioElement>(new Audio());

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you'd like the audio to contain.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress for script generation
      setGenerationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate script using AI
      const script = await generateScript(prompt);
      setGenerationProgress(60);

      // Generate audio from script
      const audioUrl = await generateAudioFromScript(script, selectedVoice);
      setGenerationProgress(100);

      const generated: GeneratedAudio = {
        script,
        audioUrl,
        voiceStyle: selectedVoice,
        status: 'completed'
      };

      setGeneratedAudio(generated);
      onAudioGenerated?.(audioUrl, script);

      toast({
        title: "Audio Generated Successfully",
        description: "Your audio content is ready to preview and download.",
      });

    } catch (error) {
      console.error('Audio generation error:', error);
      setGeneratedAudio(prev => prev ? { ...prev, status: 'error' } : null);
      toast({
        title: "Audio Generation Failed",
        description: "There was an error generating your audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateScript = async (userPrompt: string): Promise<string> => {
    // Here you would integrate with Gemini API
    // For now, return a mock script
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Welcome to this AI-generated audio content based on your request: "${userPrompt}".

This is a professionally crafted script that addresses your specific needs. The content has been structured to be engaging, informative, and perfectly suited for audio presentation.

Whether you're creating content for podcasts, presentations, or any other audio medium, this script provides a solid foundation that you can further customize as needed.

Thank you for using our AI audio generation service. We hope this content meets your expectations and serves your intended purpose effectively.`;
  };

  const generateAudioFromScript = async (script: string, voice: string): Promise<string> => {
    // Here you would integrate with ElevenLabs or another TTS service
    // For now, return a mock audio URL
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would:
    // 1. Send the script to TTS API
    // 2. Receive the audio file
    // 3. Return the audio URL
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+z2vm';
  };

  const handlePlay = () => {
    if (!generatedAudio?.audioUrl) return;

    if (isPlaying) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      audioRef.src = generatedAudio.audioUrl;
      audioRef.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!generatedAudio?.audioUrl) return;

    const link = document.createElement('a');
    link.href = generatedAudio.audioUrl;
    link.download = 'generated-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your audio file is being downloaded.",
    });
  };

  React.useEffect(() => {
    audioRef.onended = () => setIsPlaying(false);
    return () => {
      audioRef.pause();
    };
  }, [audioRef]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="floating" size="icon" className="relative">
          <Headphones className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Audio Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe your audio content
              </label>
              <Textarea
                placeholder="e.g., Create a 30-second podcast intro about AI in education, or Generate a professional voiceover for my app introduction"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Voice Style
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceStyles.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col items-start">
                        <span>{voice.name}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <Card className="bg-gradient-glow border border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="font-medium">Generating your audio content...</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">
                  {generationProgress < 30 && "Creating script..."}
                  {generationProgress >= 30 && generationProgress < 70 && "Generating audio..."}
                  {generationProgress >= 70 && "Finalizing..."}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Content */}
          {generatedAudio && (
            <Card className="border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Script Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Generated Script</label>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                    {generatedAudio.script}
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-gradient-card p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Audio Preview</span>
                    <span className="text-xs text-muted-foreground">
                      Voice: {voiceStyles.find(v => v.id === generatedAudio.voiceStyle)?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="glow"
                      size="icon"
                      onClick={handlePlay}
                      className="flex-shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Waveform Visualization */}
                    <div className="flex-1 flex items-center gap-1 h-8">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "bg-primary/30 rounded-full transition-all duration-200",
                            isPlaying && "animate-waveform bg-primary"
                          )}
                          style={{
                            width: '3px',
                            height: `${4 + Math.random() * 20}px`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>

                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateAudio}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
              variant="glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Generate Audio
                </>
              )}
            </Button>
            
            {generatedAudio && (
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}