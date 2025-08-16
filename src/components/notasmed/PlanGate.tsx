
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
  
  // This is a simplified role mapping.
  // In a real app, this might come from a config or an API.
  const planRoles: Record<Plan, Plan[]> = {
    'Free': ['Medico'],
    'Clinica': ['Medico'],
    'Hospital': ['Admin', 'Medico'],
    'Medico': ['Medico'],
    'Admin': ['Admin', 'Medico'],
  };

  const userPlan = user?.plan || 'Free';
  const rolesForUser = planRoles[userPlan] || [];

  const hasAccess = allowedPlans.some(allowedPlan => rolesForUser.includes(allowedPlan));


  if (!user || !hasAccess) {
    // If the feature is admin-only and the user is not in a plan that can be an admin,
    // it's better to just not render anything to avoid confusion.
    if (allowedPlans.includes('Admin') && user?.plan !== 'Hospital') {
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
