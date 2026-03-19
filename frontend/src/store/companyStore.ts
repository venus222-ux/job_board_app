import { create } from "zustand";

export interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  slug: string;
}

interface CompanyState {
  companies: Company[];
  company: Company | null;
  setCompanies: (data: Company[]) => void;
  setCompany: (data: Company | null) => void;
  removeCompany: (id: number) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  company: null,
  setCompanies: (data) => set({ companies: data }),
  setCompany: (data) => set({ company: data }),
  removeCompany: (id) =>
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
      company: state.company?.id === id ? null : state.company,
    })),
}));
