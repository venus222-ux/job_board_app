export interface Skill {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
}
export interface Company {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

export interface Application {
  id: number;
  created_at: string;
  viewed_at?: string | null;
  cv_url?: string;
  candidate?: Candidate;

  job: {
    id: number;
    title: string;
    location: string;

    company: {
      id: number;
      name: string;
      logo?: string;
      website?: string;
    };
  };
}

export interface Job {
  id: number;
  slug: string; // required for SEO routing

  title: string;
  description?: string;
  location: string;

  job_type?: string;
  experience_level?: string;

  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_type?: string;

  is_remote?: boolean;

  status?: "published" | "draft" | "closed";

  company?: Company;

  categories?: Category[];
  skills?: Skill[];

  applications?: Application[];

  created_at?: string;
  updated_at?: string;
}
