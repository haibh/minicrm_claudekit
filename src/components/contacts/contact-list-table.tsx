"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagBadge } from "@/components/shared/tag-badge";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DecisionMakerBadge } from "@/components/contacts/decision-maker-badge";
import { deleteContact } from "@/actions/contact-actions";
import { AuthorityLevel } from "@/generated/prisma/client";
import { Users } from "lucide-react";
import { formatAuthorityLevel } from "@/lib/format-display-utils";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  isDecisionMaker: boolean;
  authorityLevel: AuthorityLevel | null;
  company: {
    id: string;
    name: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  _count: {
    deals: number;
    activities: number;
  };
}

interface ContactListTableProps {
  contacts: Contact[];
}

export function ContactListTable({ contacts }: ContactListTableProps) {
  const router = useRouter();

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No contacts</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new contact.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Decision Maker</TableHead>
            <TableHead>Authority</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/contacts/${contact.id}`)}
            >
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>{contact.company.name}</TableCell>
              <TableCell>{contact.jobTitle || "-"}</TableCell>
              <TableCell>
                <DecisionMakerBadge
                  isDecisionMaker={contact.isDecisionMaker}
                  authorityLevel={contact.authorityLevel}
                />
              </TableCell>
              <TableCell>{formatAuthorityLevel(contact.authorityLevel)}</TableCell>
              <TableCell className="text-sm">{contact.phone || "-"}</TableCell>
              <TableCell className="text-sm">{contact.email || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.slice(0, 2).map(({ tag }) => (
                    <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                  {contact.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{contact.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteDialog
                  itemName={contact.name}
                  onConfirm={async () => {
                    await deleteContact(contact.id);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
