// frontend/src/hooks/useEmployerCompany.ts
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";

export const useEmployerCompany = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await companyService.getEmployerCompany();
      setCompany(res.data);
    } catch (err) {
      console.error("Failed to fetch employer company", err);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return { company, loading, fetchCompany, setCompany };
};
