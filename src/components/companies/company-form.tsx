"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanySize } from "@/generated/prisma/client";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: CompanySize | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
}

interface CompanyFormProps {
  company?: Company;
  action: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Company"}
    </Button>
  );
}

export function CompanyForm({ company, action }: CompanyFormProps) {
  const [size, setSize] = useState<string>(company?.size || "");
  const tagNames = company?.tags.map((t) => t.tag.name).join(", ") || "";

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{company ? "Edit Company" : "Create Company"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={company?.name}
                required
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                defaultValue={company?.industry || ""}
                placeholder="Technology"
              />
            </div>

            <div>
              <Label htmlFor="size">Company Size</Label>
              <Select name="size" value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiny_1_10">1-10 employees</SelectItem>
                  <SelectItem value="small_11_50">11-50 employees</SelectItem>
                  <SelectItem value="medium_51_200">51-200 employees</SelectItem>
                  <SelectItem value="large_201_500">201-500 employees</SelectItem>
                  <SelectItem value="enterprise_500_plus">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={company?.website || ""}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={company?.phone || ""}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={company?.email || ""}
                placeholder="contact@example.com"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={company?.address || ""}
                placeholder="123 Main St, City, State, ZIP"
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={tagNames}
                placeholder="customer, partner, prospect (comma-separated)"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={company?.notes || ""}
                placeholder="Additional information about this company..."
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
