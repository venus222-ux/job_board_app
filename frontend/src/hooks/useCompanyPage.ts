// frontend/src/hooks/useCompanyPage.ts
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";

export const useCompanyPage = (slug?: string) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await companyService.getCompanyBySlug(slug);
        setCompany(res.data);
      } catch {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  return { company, loading };
};
