"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagBadge } from "@/components/shared/tag-badge";
import { DecisionMakerBadge } from "@/components/contacts/decision-maker-badge";
import { AuthorityLevel } from "@/generated/prisma/client";
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  FileText,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  isDecisionMaker: boolean;
  authorityLevel: AuthorityLevel | null;
  notes: string | null;
  company: {
    id: string;
    name: string;
    industry: string | null;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

interface ContactDetailCardProps {
  contact: Contact;
}

export function ContactDetailCard({ contact }: ContactDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Company</p>
            <Link
              href={`/companies/${contact.company.id}`}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Building2 className="h-4 w-4" />
              <div>
                <p className="font-medium">{contact.company.name}</p>
                {contact.company.industry && (
                  <p className="text-xs text-gray-500">{contact.company.industry}</p>
                )}
              </div>
            </Link>
          </div>

          {contact.jobTitle && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Job Title</p>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <p className="font-medium">{contact.jobTitle}</p>
              </div>
            </div>
          )}

          {contact.email && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {contact.phone && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-2">Decision Maker Status</p>
            <DecisionMakerBadge
              isDecisionMaker={contact.isDecisionMaker}
              authorityLevel={contact.authorityLevel}
            />
          </div>

          {contact.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map(({ tag }) => (
                  <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                ))}
              </div>
            </div>
          )}
        </div>

        {contact.notes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500">Notes</p>
            </div>
            <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
              {contact.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
