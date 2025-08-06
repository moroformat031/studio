
"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { TranscriptionCard } from './TranscriptionCard';
import { SummaryCard } from './SummaryCard';
import { transcribeMedicalAppointment } from '@/ai/flows/transcribe-medical-appointment';
import { summarizeMedicalAppointment } from '@/ai/flows/summarize-medical-appointment';
import { PlanGate } from './PlanGate';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface NotasMedAppProps {
    onSave: (note: { transcription: string; summary: string; date: string }) => void;
    onCancel: () => void;
    isProviderSelected: boolean;
}

export function NotasMedApp({ onSave, onCancel, isProviderSelected }: NotasMedAppProps) {
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
        title: "Transcripción Completa",
        description: "El audio ha sido transcrito exitosamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falló la Transcripción",
        description: "Ocurrió un error al transcribir el audio. Por favor, inténtelo de nuevo.",
      });
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcription.trim()) {
      toast({
        variant: "destructive",
        title: "No se puede resumir",
        description: "Por favor, proporcione una transcripción antes de generar un resumen.",
      });
      return;
    }
    setIsLoadingSummary(true);
    try {
      const result = await summarizeMedicalAppointment({ transcription });
      setSummary(result.summary);
      toast({
        title: "Resumen Generado",
        description: "El resumen de IA ha sido creado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falló la Resumición",
        description: "Ocurrió un error al generar el resumen. Por favor, inténtelo de nuevo.",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };
  
  const handleSaveNote = () => {
    if (!transcription && !summary) {
        toast({
            variant: "destructive",
            title: "No se puede Guardar la Nota",
            description: "Por favor, proporcione una transcripción o un resumen antes de guardar.",
        });
        return;
    }
    onSave({
        transcription,
        summary,
        date: new Date().toISOString(),
    });
     toast({
        title: "Nota Guardada",
        description: "La nota de consulta ha sido agregada al expediente del paciente.",
    });
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4" style={{ opacity: isProviderSelected ? 1 : 0.5, pointerEvents: isProviderSelected ? 'auto' : 'none' }}>
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
        <Separator />
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button onClick={handleSaveNote} disabled={!isProviderSelected}>Guardar Nota</Button>
        </div>
    </div>
  );
}
