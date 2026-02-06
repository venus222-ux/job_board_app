import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCompanyStore, Company } from "../../store/companyStore";
import CompanyForm from "../Company/CompanyForm";
import API from "../../api";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const { companies, company, setCompany, setCompanies, removeCompany } =
    useCompanyStore();
  const [showForm, setShowForm] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await API.get("/employer/companies");
      setCompanies(res.data);
      if (!company && res.data.length > 0) setCompany(res.data[0]);
    } catch {
      setCompanies([]);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const selectCompany = (c: Company) => setCompany(c);

  const editCompany = (c: Company) => {
    setCompany(c);
    setShowForm(true);
  };

  const deleteCompany = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await API.delete(`/employer/companies/${id}`);
      removeCompany(id);
      toast.success("Company deleted");
    } catch {
      toast.error("Failed to delete company");
    }
  };

  return (
    <div className="container mt-4">
      <h2>🏢 Employer Dashboard</h2>

      <div className="mb-3 d-flex gap-2 flex-wrap">
        {companies.map((c) => (
          <button
            key={c.id}
            className={`btn btn-sm ${
              company?.id === c.id ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => selectCompany(c)}
          >
            {c.name}
          </button>
        ))}
        <button
          className="btn btn-success btn-sm"
          onClick={() => {
            setCompany(null);
            setShowForm(true);
          }}
        >
          + Add Company
        </button>
      </div>

      {showForm && <CompanyForm onClose={() => setShowForm(false)} />}

      {company && (
        <div className="card p-3 mt-3">
          {company.logo && (
            <img
              src={`http://localhost:8000/storage/${company.logo}`}
              width={120}
              className="mb-3"
            />
          )}
          <h4>{company.name}</h4>
          <p>{company.description}</p>
          {company.website && (
            <p>
              <a
                href={
                  company.website.startsWith("http")
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            </p>
          )}

          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-warning btn-sm"
              onClick={() => editCompany(company)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteCompany(company.id)}
            >
              Delete
            </button>
            <Link
              to={`/companies/${company.slug}`}
              className="btn btn-primary btn-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
