import { useEffect } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { useCompanyStore } from "../../store/companyStore";
import CompanyForm from "../Company/CompanyForm";

const EmployerDashboard = () => {
  const { company, setCompany } = useCompanyStore();

  useEffect(() => {
    API.get("/employer/company")
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
          <small>Slug: /companies/{company.slug}</small>
        </div>
      )}

      <CompanyForm />
    </div>
  );
};

export default EmployerDashboard;
