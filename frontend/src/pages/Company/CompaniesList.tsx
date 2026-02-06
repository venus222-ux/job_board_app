import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCompanyStore } from "../../store/companyStore";
import API from "../../api";

const CompaniesList = () => {
  const { companies, setCompanies } = useCompanyStore();

  useEffect(() => {
    API.get("/companies")
      .then((res) => setCompanies(res.data))
      .catch(() => setCompanies([]));
  }, [setCompanies]);

  return (
    <div className="container mt-4">
      <h2>🏢 Companies</h2>
      <div className="row">
        {companies.length === 0 && <p>No companies found.</p>}

        {companies.map((company) => (
          <div className="col-md-4 mb-3" key={company.id}>
            <div className="card h-100 p-3">
              {company.logo && (
                <img
                  src={`http://localhost:8000/storage/${company.logo}`}
                  alt={company.name}
                  className="img-fluid mb-2"
                />
              )}
              <h4>{company.name}</h4>
              <p>{company.description}</p>
              <Link
                to={`/companies/${company.slug}`}
                className="btn btn-sm btn-primary"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesList;
