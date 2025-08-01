"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Button } from '../ui/button';

type Plan = 'Free' | 'Pro' | 'Admin';

interface PlanGateProps {
  allowedPlans: Plan[];
  children: ReactNode;
}

export function PlanGate({ allowedPlans, children }: PlanGateProps) {
  const { user } = useAuth();

  if (!user || !allowedPlans.includes(user.plan)) {
    return (
      <Card className="flex flex-col items-center justify-center text-center bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            Upgrade Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">This feature is available for {allowedPlans.join(' or ')} users.</p>
          <Button>Upgrade Plan</Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
