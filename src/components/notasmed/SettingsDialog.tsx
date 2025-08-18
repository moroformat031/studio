
"use client";

import { ReactNode, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/context/AuthContext";
import { DoctorAvailability, Plan } from "@/types/ehr";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SettingsDialogProps {
  children: ReactNode;
}

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function AvailabilityTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/users/${user.id}/availability`);
          if (res.ok) {
            const data = await res.json();
            const initialData = daysOfWeek.map((day, index) => {
                const existing = data.find((d: DoctorAvailability) => d.dayOfWeek === index);
                return existing || { dayOfWeek: index, startTime: '09:00', endTime: '17:00', isAvailable: false };
            });
            setAvailability(initialData);
          }
        } catch (e) {
          console.error("Failed to fetch availability", e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAvailability();
  }, [user]);

  const handleAvailabilityChange = (index: number, field: keyof DoctorAvailability, value: any) => {
    const newAvailability = [...availability];
    (newAvailability[index] as any)[field] = value;
    setAvailability(newAvailability);
  };
  
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        const res = await fetch(`/api/users/${user.id}/availability`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(availability)
        });
        if (!res.ok) throw new Error('Failed to save availability');
        toast({ title: "Disponibilidad Guardada", description: "Su horario de trabajo ha sido actualizado." });
    } catch(e) {
        toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar la disponibilidad." });
    } finally {
        setIsSaving(false);
    }
  }

  if(isLoading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <h4 className="font-medium">Horario Semanal</h4>
            <p className="text-sm text-muted-foreground">
                Define tus horas de trabajo para que los pacientes puedan programar citas.
            </p>
        </div>
        <div className="space-y-4">
            {availability.map((day, index) => (
                <div key={day.dayOfWeek} className="grid grid-cols-4 items-center gap-4">
                    <Label className="col-span-1">{daysOfWeek[day.dayOfWeek]}</Label>
                    <div className="col-span-3 flex items-center gap-4">
                        <Switch
                            checked={day.isAvailable}
                            onCheckedChange={(checked) => handleAvailabilityChange(index, 'isAvailable', checked)}
                        />
                        <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                            disabled={!day.isAvailable}
                            className="w-full"
                        />
                        <span className={cn(day.isAvailable ? 'text-foreground' : 'text-muted-foreground')}>a</span>
                        <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                            disabled={!day.isAvailable}
                            className="w-full"
                        />
                    </div>
                </div>
            ))}
        </div>
        <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Guardar Cambios
            </Button>
        </DialogFooter>
    </div>
  )
}

function GeneralSettingsTab() {
  const [fontSize, setFontSize] = useLocalStorage("notasmed-fontSize", 16);

  return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="font-size" className="text-right">
            Tamaño de Fuente
          </Label>
          <div className="col-span-3 flex items-center gap-4">
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
            />
            <span className="text-sm font-medium w-8 text-center">{fontSize}px</span>
          </div>
        </div>
      </div>
  );
}


export function SettingsDialog({ children }: SettingsDialogProps) {
  const { user } = useAuth();
  const isDoctor = user?.plan === 'Medico' || user?.plan === 'Admin';

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Ajusta tus preferencias para la aplicación.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full mt-4">
            <TabsList className={cn("grid w-full", isDoctor ? "grid-cols-2" : "grid-cols-1")}>
                <TabsTrigger value="general">General</TabsTrigger>
                {isDoctor && <TabsTrigger value="availability">Mi Disponibilidad</TabsTrigger>}
            </TabsList>
            <TabsContent value="general" className="py-4">
              <GeneralSettingsTab />
            </TabsContent>
            {isDoctor && (
              <TabsContent value="availability" className="py-4">
                <AvailabilityTab />
              </TabsContent>
            )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
