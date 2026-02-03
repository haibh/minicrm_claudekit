"use client";

import { Label } from "@/components/ui/label";
import { CompanySelector } from "@/components/shared/company-selector";
import { ContactSelector } from "@/components/shared/contact-selector";
import { DealSelector } from "@/components/shared/deal-selector";
import { DealStage } from "@/generated/prisma/client";

interface ActivityRelatedEntityFieldsProps {
  companies: Array<{ id: string; name: string; industry: string | null }>;
  contacts: Array<{
    id: string;
    name: string;
    company?: { name: string } | null;
  }>;
  deals: Array<{
    id: string;
    name: string;
    stage: DealStage;
    company?: { name: string } | null;
  }>;
  companyId: string;
  contactId: string;
  dealId: string;
  onCompanyChange: (value: string) => void;
  onContactChange: (value: string) => void;
  onDealChange: (value: string) => void;
}

/**
 * Related entity selectors for activity forms — company, contact, and deal.
 * Each uses a hidden input to pass the selected ID with form submission.
 */
export function ActivityRelatedEntityFields({
  companies,
  contacts,
  deals,
  companyId,
  contactId,
  dealId,
  onCompanyChange,
  onContactChange,
  onDealChange,
}: ActivityRelatedEntityFieldsProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="font-medium">Related Entities</h3>

      <div className="space-y-2">
        <Label htmlFor="companyId">Company</Label>
        <input type="hidden" name="companyId" value={companyId} />
        <CompanySelector
          companies={companies}
          value={companyId}
          onChange={onCompanyChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactId">Contact</Label>
        <input type="hidden" name="contactId" value={contactId} />
        <ContactSelector
          contacts={contacts}
          value={contactId}
          onChange={onContactChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dealId">Deal</Label>
        <input type="hidden" name="dealId" value={dealId} />
        <DealSelector deals={deals} value={dealId} onChange={onDealChange} />
      </div>
    </div>
  );
}
