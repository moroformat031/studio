
"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TranscriptionCardProps {
  transcription: string;
  setTranscription: (text: string) => void;
  isLoading: boolean;
  onTranscribe: (audioDataUri: string) => void;
}

export function TranscriptionCard({
  transcription,
  setTranscription,
  isLoading,
  onTranscribe,
}: TranscriptionCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleStartRecording = async () => {
    if (isMounted && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            onTranscribe(base64data);
          };
           // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast({ title: "Recording Started", description: "The microphone is now active." });
      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({ variant: "destructive", title: "Microphone Error", description: "Could not access the microphone. Please check your permissions." });
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: "Recording Stopped", description: "Processing audio for transcription." });
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="flex flex-col shadow-none border-0">
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Transcription
          </CardTitle>
        </div>
        {isRecording ? (
          <Button onClick={handleStopRecording} disabled={isLoading} variant="destructive" size="sm" aria-label="Stop Recording">
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button onClick={handleStartRecording} disabled={isLoading} size="sm" aria-label="Start Recording">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4 mr-2" />}
            Record
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-2">
        <Textarea
          placeholder={isLoading ? "Transcription in progress..." : isRecording ? "Recording... speak now." : "Transcribed text will appear here. You can also paste text."}
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          className="h-full min-h-[150px] resize-none"
          readOnly={isLoading || isRecording}
          aria-label="Transcription text area"
        />
      </CardContent>
    </Card>
  );
}
