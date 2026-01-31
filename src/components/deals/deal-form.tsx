"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanySelector } from "@/components/shared/company-selector";
import { ContactSelector } from "@/components/shared/contact-selector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealStage } from "@/generated/prisma/client";
import { createDeal, updateDeal } from "@/actions/deal-actions";

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

interface DealFormProps {
  companies: Company[];
  contacts: Contact[];
  deal?: {
    id: string;
    name: string;
    value: number;
    stage: DealStage;
    probability: number;
    expectedCloseDate: Date | null;
    notes: string | null;
    companyId: string;
    contactId: string | null;
  };
  defaultCompanyId?: string;
  defaultContactId?: string;
}

const stageOptions: { value: DealStage; label: string }[] = [
  { value: "prospecting", label: "Prospecting" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

export function DealForm({
  companies,
  contacts,
  deal,
  defaultCompanyId,
  defaultContactId,
}: DealFormProps) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(
    deal?.companyId || defaultCompanyId || ""
  );
  const [contactId, setContactId] = useState(
    deal?.contactId || defaultContactId || ""
  );
  const [stage, setStage] = useState<DealStage>(deal?.stage || "prospecting");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("companyId", companyId);
    if (contactId) {
      formData.set("contactId", contactId);
    }
    formData.set("stage", stage);

    try {
      if (deal) {
        await updateDeal(deal.id, formData);
      } else {
        await createDeal(formData);
      }
    } catch (error) {
      console.error("Failed to save deal:", error);
      setIsSubmitting(false);
    }
  }

  const filteredContacts = companyId
    ? contacts.filter((c) => c.company?.name === companies.find((co) => co.id === companyId)?.name)
    : contacts;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">
          Deal Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={deal?.name}
          required
          placeholder="Enter deal name"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">
            Deal Value <span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={deal?.value}
            required
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            name="probability"
            type="number"
            min="0"
            max="100"
            defaultValue={deal?.probability || 0}
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="stage">
          Stage <span className="text-red-500">*</span>
        </Label>
        <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
        <Input
          id="expectedCloseDate"
          name="expectedCloseDate"
          type="date"
          defaultValue={
            deal?.expectedCloseDate
              ? new Date(deal.expectedCloseDate).toISOString().split("T")[0]
              : ""
          }
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="companyId">
          Company <span className="text-red-500">*</span>
        </Label>
        <div className="mt-1">
          <CompanySelector
            companies={companies}
            value={companyId}
            onChange={setCompanyId}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contactId">Contact</Label>
        <div className="mt-1">
          <ContactSelector
            contacts={filteredContacts}
            value={contactId}
            onChange={setContactId}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={deal?.notes || ""}
          placeholder="Add any notes about this deal"
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !companyId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
