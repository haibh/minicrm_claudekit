"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanySelector } from "@/components/shared/company-selector";
import { ContactDecisionMakerFields } from "@/components/contacts/contact-decision-maker-fields";
import { AuthorityLevel } from "@/generated/prisma/client";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  isDecisionMaker: boolean;
  authorityLevel: AuthorityLevel | null;
  notes: string | null;
  companyId: string;
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
}

interface Company {
  id: string;
  name: string;
  industry: string | null;
}

interface ContactFormProps {
  contact?: Contact;
  companies: Company[];
  action: (formData: FormData) => Promise<void>;
  defaultCompanyId?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Contact"}
    </Button>
  );
}

export function ContactForm({ contact, companies, action, defaultCompanyId }: ContactFormProps) {
  const [companyId, setCompanyId] = useState<string>(
    contact?.companyId || defaultCompanyId || ""
  );
  const [isDecisionMaker, setIsDecisionMaker] = useState<boolean>(
    contact?.isDecisionMaker || false
  );
  const [authorityLevel, setAuthorityLevel] = useState<string>(
    contact?.authorityLevel || ""
  );
  const tagNames = contact?.tags.map((t) => t.tag.name).join(", ") || "";

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{contact ? "Edit Contact" : "Create Contact"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">
                Contact Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={contact?.name}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="companyId">
                Company <span className="text-red-500">*</span>
              </Label>
              <input type="hidden" name="companyId" value={companyId} />
              <CompanySelector
                companies={companies}
                value={companyId}
                onChange={setCompanyId}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email || ""}
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact?.phone || ""}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                defaultValue={contact?.jobTitle || ""}
                placeholder="Chief Technology Officer"
              />
            </div>

            {/* Decision maker checkbox + conditional authority level select */}
            <ContactDecisionMakerFields
              isDecisionMaker={isDecisionMaker}
              authorityLevel={authorityLevel}
              onDecisionMakerChange={setIsDecisionMaker}
              onAuthorityLevelChange={setAuthorityLevel}
            />

            <div className="col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={tagNames}
                placeholder="vip, technical, manager (comma-separated)"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={contact?.notes || ""}
                placeholder="Additional information about this contact..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
