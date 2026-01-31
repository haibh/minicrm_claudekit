"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contact {
  id: string;
  name: string;
  company?: {
    name: string;
  } | null;
}

interface ContactSelectorProps {
  contacts: Contact[];
  value?: string;
  onChange: (id: string) => void;
}

export function ContactSelector({ contacts, value, onChange }: ContactSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a contact" />
      </SelectTrigger>
      <SelectContent>
        {contacts.map((contact) => (
          <SelectItem key={contact.id} value={contact.id}>
            <div className="flex flex-col">
              <span className="font-medium">{contact.name}</span>
              {contact.company && (
                <span className="text-xs text-gray-500">{contact.company.name}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
