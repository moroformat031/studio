
"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Plan } from '@/types/ehr';

interface PlanGateProps {
  allowedPlans: Plan[];
  children: ReactNode;
}

export function PlanGate({ allowedPlans, children }: PlanGateProps) {
  const { user } = useAuth();
  
  const hasAccess = user && allowedPlans.includes(user.plan);

  if (!hasAccess) {
    if (allowedPlans.includes('Admin')) {
        return null;
    }
    
    return (
      <Card className="flex flex-col items-center justify-center text-center bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            Actualización Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Esta función no está disponible en tu plan actual.</p>
          <Button>Actualizar Plan</Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

    