"use client";

import { Sparkles, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface SummaryCardProps {
  transcription: string;
  summary: string;
  setSummary: (text: string) => void;
  isLoading: boolean;
  onSummarize: () => void;
}

export function SummaryCard({
  transcription,
  summary,
  setSummary,
  isLoading,
  onSummarize,
}: SummaryCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Summary & Notes
          </CardTitle>
          <CardDescription>Generate an AI summary and add your own notes.</CardDescription>
        </div>
        <Button onClick={onSummarize} disabled={isLoading || !transcription} size="icon" aria-label="Generate Summary">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          placeholder={isLoading ? "Generating summary..." : "Your AI-generated summary and manual notes will appear here."}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="h-full min-h-[300px] resize-none text-base"
          readOnly={isLoading}
          aria-label="Summary and notes text area"
        />
      </CardContent>
    </Card>
  );
}
