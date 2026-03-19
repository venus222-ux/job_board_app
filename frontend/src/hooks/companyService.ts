// API layer
import API from "../api";

export const companyService = {
  getEmployerCompany: () => API.get("/employer/company"),
  getCompanies: () => API.get("/companies"),
  getCompanyBySlug: (slug: string) => API.get(`/companies/${slug}`),
  saveCompany: (formData: FormData) => API.post("/employer/company", formData),
};
