"use client";

import { Download, Settings, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from './SettingsDialog';

interface HeaderProps {
  onExport: () => void;
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold font-headline tracking-tight">
            NotasMed
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onExport} aria-label="Export Notes">
            <Download className="h-4 w-4" />
          </Button>
          <SettingsDialog>
            <Button variant="outline" size="icon" aria-label="Open Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </SettingsDialog>
        </div>
      </div>
    </header>
  );
}
