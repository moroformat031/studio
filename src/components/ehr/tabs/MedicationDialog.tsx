
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
import { Medication } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';

interface MedicationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medication: Omit<Medication, 'id'> | Medication) => void;
    medication: Medication | null;
}

export function MedicationDialog({ isOpen, onClose, onSave, medication }: MedicationDialogProps) {
    const { toast } = useToast();
    const initialState = useMemo(() => ({
        prescribedDate: new Date().toISOString().split('T')[0],
        name: '',
        dosage: '',
        frequency: ''
    }), []);

    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if (medication) {
            setFormData({
                ...medication,
                prescribedDate: new Date(medication.prescribedDate).toISOString().split('T')[0]
            });
        } else {
            setFormData(initialState);
        }
    }, [medication, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.prescribedDate || !formData.name || !formData.dosage || !formData.frequency) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }

        const dataToSave = medication 
            ? { ...medication, ...formData } 
            : formData;
        
        onSave(dataToSave);
        onClose();
        toast({
            title: `Medication ${medication ? 'Updated' : 'Added'}`,
            description: `The medication has been successfully ${medication ? 'updated' : 'saved'}.`
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
          <DialogTitle>{medication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
          <DialogDescription>
            {medication ? 'Update the details for this medication.' : 'Enter the details for the new medication.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prescribedDate" className="text-right">
              Date
            </Label>
            <Input id="prescribedDate" type="date" value={formData.prescribedDate} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Medication
            </Label>
            <Input id="name" placeholder="e.g. Lisinopril" value={formData.name} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dosage" className="text-right">
              Dosage
            </Label>
            <Input id="dosage" placeholder="e.g. 10mg" value={formData.dosage} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Input id="frequency" placeholder="e.g. Once a day" value={formData.frequency} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSave}>Save Medication</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
