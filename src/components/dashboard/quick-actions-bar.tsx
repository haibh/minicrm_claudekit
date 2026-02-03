"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus, Handshake, Plus } from "lucide-react";

export function QuickActionsBar() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="default">
        <Link href="/companies/new" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          New Company
        </Link>
      </Button>
      <Button asChild variant="default">
        <Link href="/contacts/new" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          New Contact
        </Link>
      </Button>
      <Button asChild variant="default">
        <Link href="/deals/new" className="flex items-center gap-2">
          <Handshake className="w-4 h-4" />
          New Deal
        </Link>
      </Button>
      <Button asChild variant="default">
        <Link href="/activities/new" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Log Activity
        </Link>
      </Button>
    </div>
  );
}
