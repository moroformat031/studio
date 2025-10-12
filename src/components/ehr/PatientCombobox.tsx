import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Patient } from "@/types/ehr";

interface PatientComboboxProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

export function PatientCombobox({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const getPatientName = (patient: Patient) => {
    return `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ""}`.trim();
  };

  const selectedPatientName = patients.find(
    (patient) => patient.id === selectedPatientId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatientName
            ? getPatientName(selectedPatientName)
            : "Seleccionar paciente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar paciente..." />
          <CommandList>
            <CommandEmpty>No se encontró ningún paciente.</CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={getPatientName(patient)}
                  onSelect={() => {
                    onSelectPatient(patient.id);
                    setOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectPatient(patient.id);
                    setOpen(false);
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onSelectPatient(patient.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPatientId === patient.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getPatientName(patient)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
