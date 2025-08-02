
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
    <Card className="flex flex-col shadow-none border-0">
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="h-4 w-4" />
            Summary & Notes
          </CardTitle>
        </div>
        <Button onClick={onSummarize} disabled={isLoading || !transcription} size="sm" variant="ghost" aria-label="Generate Summary">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
           <span className="ml-2">Generate</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-2">
        <Textarea
          placeholder={isLoading ? "Generating summary..." : "AI summary and manual notes will appear here."}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="h-full min-h-[150px] resize-none"
          readOnly={isLoading}
          aria-label="Summary and notes text area"
        />
      </CardContent>
    </Card>
  );
}
