import { CompanyForm } from "@/components/companies/company-form";
import { createCompany } from "@/actions/company-actions";
import { PageHeader } from "@/components/layout/page-header";

export default function NewCompanyPage() {
  return (
    <div>
      <PageHeader title="Create Company" description="Add a new company to your CRM" />
      <CompanyForm action={createCompany} />
    </div>
  );
}
