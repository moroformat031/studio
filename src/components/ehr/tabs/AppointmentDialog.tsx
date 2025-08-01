
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/types/ehr';
import { useToast } from '@/hooks/use-toast';

interface AppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id'> | Appointment) => void;
    appointment: Appointment | null;
}

export function AppointmentDialog({ isOpen, onClose, onSave, appointment }: AppointmentDialogProps) {
    const { toast } = useToast();
    const initialState = useMemo(() => ({
        date: new Date().toISOString().split('T')[0],
        time: '',
        reason: '',
        status: 'Scheduled' as const
    }), []);

    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if (appointment) {
            setFormData({
                ...appointment,
                date: new Date(appointment.date).toISOString().split('T')[0]
            });
        } else {
            setFormData(initialState);
        }
    }, [appointment, isOpen, initialState]);


    const handleSave = () => {
        if (!formData.date || !formData.time || !formData.reason) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }

        const dataToSave = appointment 
            ? { ...appointment, ...formData } 
            : formData;
        
        onSave(dataToSave);
        onClose();
        toast({
            title: `Appointment ${appointment ? 'Updated' : 'Scheduled'}`,
            description: `The appointment has been successfully ${appointment ? 'updated' : 'saved'}.`
        })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleStatusChange = (value: Appointment['status']) => {
        setFormData(prev => ({ ...prev, status: value }));
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
          <DialogDescription>
            {appointment ? 'Update the details for this appointment.' : 'Enter the details for the new appointment.'}
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
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input id="time" type="time" value={formData.time} onChange={handleInputChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Input id="reason" value={formData.reason} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
             <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSave}>Save Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
