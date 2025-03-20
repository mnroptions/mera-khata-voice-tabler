
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Mic, MicOff } from 'lucide-react';
import { Transaction } from '@/types';

interface VoiceInputProps {
  onTransactionAdded: (transaction: Transaction) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTransactionAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
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
            recognitionRef.current?.start();
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
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current?.start();
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

    setProcessing(true);
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
      
      // Reset transcript and processing states
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
    } finally {
      setProcessing(false);
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
            className="flex-1 transition-all duration-300 ease-in-out"
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Listening
              </>
            )}
          </Button>
          
          <Button
            onClick={processTranscript}
            disabled={!transcript || processing || !isListening}
            variant="outline"
            size="lg"
            className="flex-1 transition-all duration-300 ease-in-out"
          >
            Add Transaction
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
