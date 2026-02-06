// frontend/src/pages/Company/CompaniesList.tsx
import { Link } from "react-router-dom";
import { useCompanies } from "../../hooks/useCompanies";

const CompaniesList = () => {
  const { companies, loading } = useCompanies();

  if (loading) return <p className="mt-4">Loading companies...</p>;

  return (
    <div className="container mt-4">
      <h2>🏢 Companies</h2>
      <div className="row">
        {companies.map((c) => (
          <div key={c.id} className="col-md-4">
            <div className="card p-3 mb-3">
              <h4>{c.name}</h4>
              <Link to={`/companies/${c.slug}`}>View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesList;
