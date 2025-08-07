
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

  const userRoles: Record<Plan, Plan[]> = {
    Free: ['Free', 'Medico'],
    Clinica: ['Clinica', 'Medico'],
    Hospital: ['Hospital', 'Admin', 'Medico'],
    Medico: [],
    Admin: [],
  };

  const userPlan: Plan = user?.plan ?? 'Free';
  
  const hasAccess = allowedPlans.some(plan => userRoles[userPlan]?.includes(plan));

  if (!user || !hasAccess) {
    // Hide the gate for plans that should have access, but the feature is admin-only.
    // E.g. A "Medico" shouldn't see an "Upgrade to Admin" message for an admin-only feature.
    const isAdminFeature = allowedPlans.includes('Admin') && !allowedPlans.includes('Medico');
    if (isAdminFeature && user?.plan !== 'Hospital') {
        return null;
    }
    
    // For other cases, show the upgrade message
    return (
      <Card className="flex flex-col items-center justify-center text-center bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            Actualización Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Esta función está disponible para usuarios de {allowedPlans.join(' o ')}.</p>
          <Button>Actualizar Plan</Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
