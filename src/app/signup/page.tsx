
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plan } from '@/types/ehr';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('Free');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Since we removed username/password fields, we'll need to adjust how signup works.
      // For now, let's generate a placeholder user or adjust the auth context.
      // For this example, we'll just use the plan name as a user differentiator.
      const tempUsername = `${selectedPlan.toLowerCase()}-user-${Math.floor(Math.random() * 1000)}`;
      const tempPassword = 'password';

      await signup(tempUsername, tempPassword, selectedPlan);
      toast({
        title: "¡Cuenta Creada!",
        description: `Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión. Tu usuario es: ${tempUsername}`,
      });
      router.push('/login');
    } catch (error) {
        const e = error as Error;
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: e.message,
      });
    } finally {
        setIsLoading(false);
    }
  };

  const plans = [
    { name: 'Free', price: '$0/mes', description: 'Funcionalidad básica para empezar.', features: ['Transcripción IA', 'Gestión de Pacientes (limitado)'] },
    { name: 'Clinica', price: '$49/mes', description: 'Funciones avanzadas para clínicas.', features: ['Todo en Free', 'Resumen IA', 'Soporte prioritario'] },
    { name: 'Hospital', price: 'Personalizado', description: 'Control total para hospitales.', features: ['Todo en Clinica', 'Gestión de usuarios', 'Auditoría avanzada'] },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Stethoscope className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">NotasMed</h1>
            </div>
          <CardTitle>Crea tu Cuenta</CardTitle>
          <CardDescription>Elige un plan y comienza a optimizar tu práctica médica.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label>Selecciona tu Plan</Label>
               <RadioGroup
                    value={selectedPlan}
                    onValueChange={(value: Plan) => setSelectedPlan(value)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {plans.map(plan => (
                        <Label key={plan.name} htmlFor={plan.name} className={cn("flex flex-col rounded-lg border-2 p-4 cursor-pointer transition-all", selectedPlan === plan.name ? 'border-primary ring-2 ring-primary' : 'border-muted')}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{plan.name}</h3>
                                <RadioGroupItem value={plan.name} id={plan.name} className="h-4 w-4" />
                            </div>
                            <p className="text-2xl font-bold my-2">{plan.price}</p>
                            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                            <ul className="space-y-2 text-sm">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creando Cuenta...' : 'Registrarse'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="underline">
                    Inicia Sesión
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
