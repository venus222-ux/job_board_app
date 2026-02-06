export interface Skill {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Job {
  id: string | number;
  slug?: string;
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
  company?: {
    id?: number;
    name?: string;
    logo?: string;
  };
  categories?: Array<{ id: number; name: string }>;
  skills?: Array<{ id: number; name: string }>;
  applications?: Application[]; // Add this line
  created_at?: string;
  updated_at?: string;
  compoany: string;
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
  cv_url?: string; // optional CV URL
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
