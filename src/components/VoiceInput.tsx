import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function VoiceInput({
  onTranscription,
  isListening,
  onStartListening,
  onStopListening
}: VoiceInputProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      if (finalTranscript) {
        onTranscription(finalTranscript);
        handleStopListening();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}`,
        variant: "destructive",
      });
      handleStopListening();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [onTranscription]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average / 255); // Normalize to 0-1
        
        if (isListening) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  };

  const handleStartListening = async () => {
    if (recognitionRef.current) {
      try {
        onStartListening();
        await startAudioAnalysis();
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        onStopListening();
      }
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
    onStopListening();
  };

  return (
    <div className="relative">
      <Button
        variant={isListening ? "destructive" : "voice"}
        size="icon"
        onClick={isListening ? handleStopListening : handleStartListening}
        className={cn(
          "relative transition-all duration-200",
          isListening && "animate-pulse-glow"
        )}
      >
        {isListening ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {isListening && (
        <Card className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 p-4 w-64 animate-scale-in">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              <MicOff className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Listening...</span>
            </div>
            
            {/* Audio Waveform Visualization */}
            <div className="flex items-center justify-center gap-1 h-8 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary rounded-full animate-waveform"
                  style={{
                    width: '3px',
                    height: `${8 + audioLevel * 20}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>
            
            {transcript && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                {transcript}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}