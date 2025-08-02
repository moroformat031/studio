
"use client";
import React, { useState, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Demographics, Patient } from '@/types/ehr';

interface AddPatientDialogProps {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (patient: Omit<Patient, 'id' | 'vitals' | 'medications' | 'appointments' | 'procedures' | 'notes'>) => void;
}

export function AddPatientDialog({ children, open, onOpenChange, onSave }: AddPatientDialogProps) {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<Demographics['gender']>('Other');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleSave = () => {
        if (!name || !dob) {
            // Add proper validation/toast later
            console.error("Name and DOB are required");
            return;
        }
        onSave({
            name,
            demographics: { dob, gender, address, phone, email }
        });
        // Reset form
        setName('');
        setDob('');
        setGender('Other');
        setAddress('');
        setPhone('');
        setEmail('');
    }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the details for the new patient. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              Date of Birth
            </Label>
            <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender
            </Label>
             <Select onValueChange={(value: Demographics['gender']) => setGender(value)} value={gender}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
