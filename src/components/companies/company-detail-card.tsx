import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagBadge } from "@/components/shared/tag-badge";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { CompanySize } from "@/generated/prisma/client";

interface CompanyDetailCardProps {
  company: {
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
        color: string;
      };
    }>;
  };
}

export function CompanyDetailCard({ company }: CompanyDetailCardProps) {
  const formatCompanySize = (size: CompanySize | null) => {
    if (!size) return null;
    const sizeMap: Record<string, string> = {
      tiny_1_10: "1-10 employees",
      small_11_50: "11-50 employees",
      medium_51_200: "51-200 employees",
      large_201_500: "201-500 employees",
      enterprise_500_plus: "500+ employees",
    };
    return sizeMap[size] || size;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{company.name}</CardTitle>
              {company.industry && (
                <p className="text-sm text-gray-500 mt-1">{company.industry}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {company.size && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{formatCompanySize(company.size)}</span>
            </div>
          )}

          {company.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-gray-400" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {company.website}
              </a>
            </div>
          )}

          {company.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{company.phone}</span>
            </div>
          )}

          {company.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                {company.email}
              </a>
            </div>
          )}

          {company.address && (
            <div className="col-span-2 flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <span className="text-gray-700">{company.address}</span>
            </div>
          )}
        </div>

        {company.tags.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {company.tags.map(({ tag }) => (
                <TagBadge key={tag.id} name={tag.name} color={tag.color} />
              ))}
            </div>
          </div>
        )}

        {company.notes && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{company.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
