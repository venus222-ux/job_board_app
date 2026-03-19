// frontend/src/hooks/useCompanies.ts
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";

export const useCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanies();
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading };
};
