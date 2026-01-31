"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanySelector } from "@/components/shared/company-selector";
import { ContactSelector } from "@/components/shared/contact-selector";
import { DealSelector } from "@/components/shared/deal-selector";
import { ActivityType } from "@/generated/prisma/client";

interface ActivityFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    type?: ActivityType;
    subject?: string;
    description?: string | null;
    date?: Date;
    durationMinutes?: number | null;
    outcome?: string | null;
    nextSteps?: string | null;
    companyId?: string | null;
    contactId?: string | null;
    dealId?: string | null;
  };
  companies: Array<{ id: string; name: string; industry: string | null }>;
  contacts: Array<{
    id: string;
    name: string;
    company?: { name: string } | null;
  }>;
  deals: Array<{
    id: string;
    name: string;
    stage: any;
    company?: { name: string } | null;
  }>;
  submitLabel?: string;
}

export function ActivityForm({
  action,
  defaultValues,
  companies,
  contacts,
  deals,
  submitLabel = "Create Activity",
}: ActivityFormProps) {
  const searchParams = useSearchParams();
  const [type, setType] = useState<ActivityType>(
    defaultValues?.type || ("call" as ActivityType)
  );
  const [companyId, setCompanyId] = useState<string>(
    defaultValues?.companyId || searchParams.get("companyId") || ""
  );
  const [contactId, setContactId] = useState<string>(
    defaultValues?.contactId || searchParams.get("contactId") || ""
  );
  const [dealId, setDealId] = useState<string>(
    defaultValues?.dealId || searchParams.get("dealId") || ""
  );

  useEffect(() => {
    const urlContactId = searchParams.get("contactId");
    const urlCompanyId = searchParams.get("companyId");
    const urlDealId = searchParams.get("dealId");

    if (urlContactId && !defaultValues?.contactId) {
      setContactId(urlContactId);
      const contact = contacts.find((c) => c.id === urlContactId);
      if (contact && !urlCompanyId && !defaultValues?.companyId) {
        const companyFromContact = companies.find(
          (co) => co.name === contact.company?.name
        );
        if (companyFromContact) {
          setCompanyId(companyFromContact.id);
        }
      }
    }
    if (urlCompanyId && !defaultValues?.companyId) {
      setCompanyId(urlCompanyId);
    }
    if (urlDealId && !defaultValues?.dealId) {
      setDealId(urlDealId);
    }
  }, [searchParams, companies, contacts, defaultValues]);

  const formatDateForInput = (date?: Date | null) => {
    if (!date) return new Date().toISOString().slice(0, 16);
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select name="type" value={type} onValueChange={(v) => setType(v as ActivityType)}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          name="subject"
          defaultValue={defaultValues?.subject}
          required
          placeholder="Brief description of the activity"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description || ""}
          placeholder="Detailed notes about this activity"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date & Time</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            defaultValue={formatDateForInput(defaultValues?.date)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min="0"
            defaultValue={defaultValues?.durationMinutes || ""}
            placeholder="30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outcome">Outcome</Label>
        <Input
          id="outcome"
          name="outcome"
          defaultValue={defaultValues?.outcome || ""}
          placeholder="Result of this activity"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextSteps">Next Steps</Label>
        <Textarea
          id="nextSteps"
          name="nextSteps"
          defaultValue={defaultValues?.nextSteps || ""}
          placeholder="What should happen next?"
          rows={3}
        />
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="font-medium">Related Entities</h3>

        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <input type="hidden" name="companyId" value={companyId} />
          <CompanySelector
            companies={companies}
            value={companyId}
            onChange={setCompanyId}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactId">Contact</Label>
          <input type="hidden" name="contactId" value={contactId} />
          <ContactSelector
            contacts={contacts}
            value={contactId}
            onChange={setContactId}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dealId">Deal</Label>
          <input type="hidden" name="dealId" value={dealId} />
          <DealSelector deals={deals} value={dealId} onChange={setDealId} />
        </div>
      </div>

      <div className="flex gap-2 justify-end border-t pt-6">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
