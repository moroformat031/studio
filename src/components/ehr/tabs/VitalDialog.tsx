
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vital } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';

interface VitalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vital: Omit<Vital, 'id'> | Vital) => void;
    vital: Vital | null;
}

export function VitalDialog({ isOpen, onClose, onSave, vital }: VitalDialogProps) {
    const { toast } = useToast();
    const initialState = useMemo(() => ({
        date: new Date().toISOString().split('T')[0],
        hr: '',
        bp: '',
        temp: '',
        rr: ''
    }), []);

    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if (vital) {
            setFormData({
                ...vital,
                date: new Date(vital.date).toISOString().split('T')[0],
                hr: String(vital.hr),
                temp: String(vital.temp),
                rr: String(vital.rr),
            });
        } else {
            setFormData(initialState);
        }
    }, [vital, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.date || !formData.hr || !formData.bp || !formData.temp || !formData.rr) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }

        const dataToSave = {
            date: formData.date,
            hr: Number(formData.hr),
            bp: formData.bp,
            temp: Number(formData.temp),
            rr: Number(formData.rr),
        };

        const finalData = vital 
            ? { ...vital, ...dataToSave } 
            : dataToSave;
        
        onSave(finalData);
        onClose();
        toast({
            title: `Vitals ${vital ? 'Updated' : 'Saved'}`,
            description: `The vital signs have been successfully ${vital ? 'updated' : 'saved'}.`
        })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vital ? 'Edit Vitals' : 'Add New Vitals'}</DialogTitle>
          <DialogDescription>
            {vital ? 'Update the details for this vital signs entry.' : 'Enter the details for the new vital signs entry.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bp" className="text-right">
              Blood Pressure
            </Label>
            <Input id="bp" placeholder="e.g. 120/80" value={formData.bp} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hr" className="text-right">
              Heart Rate
            </Label>
            <Input id="hr" type="number" placeholder="e.g. 75" value={formData.hr} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temp" className="text-right">
              Temp (°C)
            </Label>
            <Input id="temp" type="number" placeholder="e.g. 36.8" step="0.1" value={formData.temp} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rr" className="text-right">
             Resp. Rate
            </Label>
            <Input id="rr" type="number" placeholder="e.g. 16" value={formData.rr} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSave}>Save Vitals</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
