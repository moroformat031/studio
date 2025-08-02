
"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { TranscriptionCard } from './TranscriptionCard';
import { SummaryCard } from './SummaryCard';
import { transcribeMedicalAppointment } from '@/ai/flows/transcribe-medical-appointment';
import { summarizeMedicalAppointment } from '@/ai/flows/summarize-medical-appointment';
import { PlanGate } from './PlanGate';
import { Button } from '../ui/button';

interface NotasMedAppProps {
    onSave: (note: { transcription: string; summary: string; date: string }) => void;
    onCancel: () => void;
}

export function NotasMedApp({ onSave, onCancel }: NotasMedAppProps) {
  const [transcription, setTranscription] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoadingTranscription, setIsLoadingTranscription] = useState<boolean>(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  const { toast } = useToast();

  const handleTranscribe = async (audioDataUri: string) => {
    setIsLoadingTranscription(true);
    try {
      const result = await transcribeMedicalAppointment({ audioDataUri });
      setTranscription(result.transcription);
      toast({
        title: "Transcription Complete",
        description: "The audio has been successfully transcribed.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: "An error occurred while transcribing the audio. Please try again.",
      });
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcription.trim()) {
      toast({
        variant: "destructive",
        title: "Cannot Summarize",
        description: "Please provide a transcription before generating a summary.",
      });
      return;
    }
    setIsLoadingSummary(true);
    try {
      const result = await summarizeMedicalAppointment({ transcription });
      setSummary(result.summary);
      toast({
        title: "Summary Generated",
        description: "The AI summary has been successfully created.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: "An error occurred while generating the summary. Please try again.",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };
  
  const handleSaveNote = () => {
    if (!transcription && !summary) {
        toast({
            variant: "destructive",
            title: "Cannot Save Note",
            description: "Please provide a transcription or summary before saving.",
        });
        return;
    }
    onSave({
        transcription,
        summary,
        date: new Date().toISOString(),
    });
     toast({
        title: "Note Saved",
        description: "The consultation note has been added to the patient's record.",
    });
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
            <PlanGate allowedPlans={['Free', 'Pro', 'Admin']}>
                <TranscriptionCard
                    transcription={transcription}
                    setTranscription={setTranscription}
                    isLoading={isLoadingTranscription}
                    onTranscribe={handleTranscribe}
                />
            </PlanGate>
            <PlanGate allowedPlans={['Pro', 'Admin']}>
                <SummaryCard
                    transcription={transcription}
                    summary={summary}
                    setSummary={setSummary}
                    isLoading={isLoadingSummary}
                    onSummarize={handleSummarize}
                />
            </PlanGate>
        </div>
        <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSaveNote}>Save Note</Button>
        </div>
    </div>
  );
}
