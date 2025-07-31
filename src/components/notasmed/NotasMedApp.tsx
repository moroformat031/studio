"use client";

import { useState } from 'react';
import { transcribeMedicalAppointment } from "@/ai/flows/transcribe-medical-appointment";
import { summarizeMedicalAppointment } from "@/ai/flows/summarize-medical-appointment";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Header } from './Header';
import { TranscriptionCard } from './TranscriptionCard';
import { SummaryCard } from './SummaryCard';

export function NotasMedApp() {
  const [transcription, setTranscription] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoadingTranscription, setIsLoadingTranscription] = useState<boolean>(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [fontSize] = useLocalStorage('notasmed-fontSize', 16);
  const [exportFormat] = useLocalStorage('notasmed-exportFormat', 'txt');

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

  const handleExport = () => {
    const content = `TRANSCRIPTION:\n\n${transcription}\n\n\nSUMMARY:\n\n${summary}`;
    const blob = new Blob([content], { type: `text/${exportFormat}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notasmed_export.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: `Your notes have been downloaded as a .${exportFormat} file.`
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header onExport={handleExport} />
      <main 
        className="flex-1 container mx-auto p-4 sm:p-6 md:p-8"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <TranscriptionCard
            transcription={transcription}
            setTranscription={setTranscription}
            isLoading={isLoadingTranscription}
            onTranscribe={handleTranscribe}
          />
          <SummaryCard
            transcription={transcription}
            summary={summary}
            setSummary={setSummary}
            isLoading={isLoadingSummary}
            onSummarize={handleSummarize}
          />
        </div>
      </main>
    </div>
  );
}
