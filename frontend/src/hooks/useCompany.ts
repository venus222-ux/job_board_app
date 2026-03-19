import { useEffect } from "react";
import { companyService } from "../services/companyService";
import { useCompanyStore } from "../store/companyStore";

export const useCompany = () => {
  const { company, setCompany } = useCompanyStore();

  const fetchCompany = async () => {
    try {
      const res = await companyService.getEmployerCompany();
      setCompany(res.data);
    } catch {
      setCompany(null);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return { company, fetchCompany };
};
