import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api";
import { Helmet } from "react-helmet-async";

const CompanyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    API.get(`/companies/${slug}`)
      .then((res) => setCompany(res.data))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading company details...</p>;
  if (!company) return <p>Company not found.</p>;

  return (
    <>
      <Helmet>
        <title>{company.name || "Company"} | Job Board</title>
        <meta name="description" content={company.description || ""} />
      </Helmet>

      <div className="container mt-4 text-center">
        {company.logo ? (
          <img
            src={`http://localhost:8000/storage/${company.logo}`}
            width={120}
            alt={company.name}
            className="mb-3 rounded"
          />
        ) : (
          <div
            className="mb-3 bg-secondary text-white d-inline-block"
            style={{ width: 120, height: 120, lineHeight: "120px" }}
          >
            No Logo
          </div>
        )}

        <h1>{company.name}</h1>
        <p>{company.description || "No description available."}</p>

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
      </div>
    </>
  );
};

export default CompanyPage;
