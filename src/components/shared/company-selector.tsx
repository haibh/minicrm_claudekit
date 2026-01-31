"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
  industry: string | null;
}

interface CompanySelectorProps {
  companies: Company[];
  value?: string;
  onChange: (id: string) => void;
}

export function CompanySelector({ companies, value, onChange }: CompanySelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex flex-col">
              <span className="font-medium">{company.name}</span>
              {company.industry && (
                <span className="text-xs text-gray-500">{company.industry}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
