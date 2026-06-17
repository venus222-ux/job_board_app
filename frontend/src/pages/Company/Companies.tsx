import { useEffect } from "react";
import API from "../../api";
import { useCompanyStore } from "../../store/companyStore";
import { CompanyForm } from "../Company/CompanyForm";

import type { Company } from "@/types";

export interface CompanyFormProps {
  company?: Company; 
  onSubmit: (formData: FormData, isUpdate: boolean) => void;
  onClose: () => void;
}

const EmployerDashboard = () => {
  const { company, setCompany } = useCompanyStore();

  useEffect(() => {
    API.get<Company>("/employer/company")
      .then((res) => setCompany(res.data))
      .catch(() => {});
  }, [setCompany]);

  return (
    <div className="container mt-4">
      <h2>🏢 Employer Dashboard</h2>

      {company && (
        <div className="card p-3">
          {company.logo && (
            <img
              src={`http://localhost:8000/storage/${company.logo}`}
              width={100}
            />
          )}

          <h4>{company.name}</h4>
          <p>{company.description}</p>

          {company.slug && (
            <small>Slug: /companies/{company.slug}</small>
          )}
        </div>
      )}

      <CompanyForm
        company={company}
        onSubmit={(formData, isUpdate) => {
          if (isUpdate) {
            API.post(`/companies/${company?.id}`, formData)
              .then((res) => console.log("Updated", res.data))
              .catch((err) => console.error(err));
          } else {
            API.post("/companies", formData)
              .then((res) => console.log("Created", res.data))
              .catch((err) => console.error(err));
          }
        }}
        onClose={() => {
          console.log("Form closed");
        }}
      />
    </div>
  );
};

export default EmployerDashboard;