
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Mic, MicOff } from 'lucide-react';
import { Transaction } from '@/types';

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceInputProps {
  onTransactionAdded: (transaction: Transaction) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTransactionAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptValue = result[0].transcript;
          setTranscript(transcriptValue);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            processTranscript();
            setIsListening(false);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          toast({
            title: "Error",
            description: `Speech recognition error: ${event.error}`,
            variant: "destructive"
          });
          setIsListening(false);
        };
      } else {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in this browser.",
          variant: "destructive"
        });
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    recognitionRef.current?.start();
    
    // Auto-stop after 5 seconds
    timeoutRef.current = window.setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 5000);
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Process the transcript when stopping
    if (transcript) {
      processTranscript();
    }
  };

  const processTranscript = () => {
    if (!transcript.trim()) {
      toast({
        title: "No Speech Detected",
        description: "Please speak to record a transaction.",
        variant: "destructive"
      });
      return;
    }

    setRecognizedText(transcript);
    
    try {
      // Simple parsing logic - looking for name and amount
      // Format expected: "Name amount" e.g., "John 500" or "Coffee 25.50"
      const words = transcript.trim().split(' ');
      let amount = 0;
      let nameWords: string[] = [];
      
      // Loop through words from the end to find the amount
      for (let i = words.length - 1; i >= 0; i--) {
        const possibleAmount = parseFloat(words[i].replace(/[^0-9.-]+/g, ''));
        if (!isNaN(possibleAmount)) {
          amount = possibleAmount;
          nameWords = words.slice(0, i);
          break;
        }
      }
      
      if (amount <= 0 || nameWords.length === 0) {
        throw new Error("Could not detect valid name and amount");
      }
      
      const name = nameWords.join(' ');
      
      // Create new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount,
        timestamp: new Date().toISOString(),
      };

      // Speak the confirmation
      speak(`Added ${name} with amount ${amount}`);
      
      // Add the transaction
      onTransactionAdded(newTransaction);
      
      // Reset transcript
      setTranscript('');
      
      // Show success toast
      toast({
        title: "Transaction Added",
        description: `Added ${name} with amount ${amount}`,
      });
    } catch (error) {
      console.error("Error processing transcript:", error);
      toast({
        title: "Processing Error",
        description: "Could not extract name and amount. Please try speaking clearly with name followed by amount.",
        variant: "destructive"
      });
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full p-6 glassmorphism shadow-medium transition-all duration-300 ease-in-out">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Voice Input</div>
          <div className="text-sm text-muted-foreground">
            Speak name and amount clearly
          </div>
        </div>
        
        <div className="min-h-16 p-4 bg-secondary/50 rounded-md flex items-center justify-center transition-all">
          {isListening ? (
            <div className="voice-animation">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {transcript ? transcript : "Click the microphone and speak..."}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button 
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="w-full transition-all duration-300 ease-in-out"
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Listening (auto-stops in 5s)
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Listening
              </>
            )}
          </Button>
        </div>
        
        {recognizedText && (
          <div className="text-sm text-muted-foreground mt-2 animate-fade-in">
            Last recognized: <span className="font-medium">{recognizedText}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceInput;
