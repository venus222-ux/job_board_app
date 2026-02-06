import { useParams } from "react-router-dom";
import { useCompanyPage } from "../../hooks/useCompanyPage";

const CompanyPage = () => {
  const { slug } = useParams();
  const { company, loading } = useCompanyPage(slug);

  if (loading) return <p>Loading...</p>;
  if (!company) return <p>Not found</p>;

  return (
    <div className="container mt-4">
      <h1>{company.name}</h1>
      <p>{company.description}</p>
    </div>
  );
};

export default CompanyPage;
