"use client";

import { Label } from "@/components/ui/label";
import { CompanySelector } from "@/components/shared/company-selector";
import { ContactSelector } from "@/components/shared/contact-selector";

interface Company {
  id: string;
  name: string;
  industry: string | null;
}

interface Contact {
  id: string;
  name: string;
  company?: {
    name: string;
  } | null;
}

interface DealEntitySelectorsProps {
  companies: Company[];
  contacts: Contact[];
  companyId: string;
  contactId: string;
  onCompanyChange: (value: string) => void;
  onContactChange: (value: string) => void;
}

/**
 * Company + contact cascading selectors for deal forms.
 * Filters contacts by selected company when a company is chosen.
 */
export function DealEntitySelectors({
  companies,
  contacts,
  companyId,
  contactId,
  onCompanyChange,
  onContactChange,
}: DealEntitySelectorsProps) {
  // Filter contacts to those belonging to the selected company
  const filteredContacts = companyId
    ? contacts.filter(
        (c) =>
          c.company?.name ===
          companies.find((co) => co.id === companyId)?.name
      )
    : contacts;

  return (
    <>
      <div>
        <Label htmlFor="companyId">
          Company <span className="text-red-500">*</span>
        </Label>
        <div className="mt-1">
          <CompanySelector
            companies={companies}
            value={companyId}
            onChange={onCompanyChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contactId">Contact</Label>
        <div className="mt-1">
          <ContactSelector
            contacts={filteredContacts}
            value={contactId}
            onChange={onContactChange}
          />
        </div>
      </div>
    </>
  );
}
