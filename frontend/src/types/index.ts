// ========================
// BASIC ENTITIES
// ========================

export interface Skill {
  id: number;
  name: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}
export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}


export interface Candidate {
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
  slug?: string; 
}

// ========================
// APPLICATION
// ========================

export interface Application {
  id: number;
  created_at: string;
  viewed_at?: string | null;
  resume_path?: string;

  candidate: Candidate; // ✅ remove ?
  
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

// ========================
// JOB
// ========================

export interface Job {
  id: number;
  slug: string;

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

// ========================
// AUTH API TYPES
// ========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type?: string;
  expires_in?: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ProfileData {
  email: string;
  created_at?: string;
}

export interface ProfileUpdateRequest {
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface APIMessageResponse {
  message: string;
}

// ========================
// INTERNAL AXIOS HELPERS TYPES (optional use elsewhere)
// ========================

export type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};


export interface JobView {
  _id: string;
  views: number;
}

export interface DashboardData {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  pendingApplications: number;

  recentUsers: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }[];

  recentApplications: {
    id: number;
    candidate: { name: string };
    job: { title: string };
    created_at: string;
    viewed_at: string | null;
  }[];

  jobStatusDistribution: { status: string; count: number }[];
  userRoleDistribution: { role: string; count: number }[];
  monthlyApplications: { month: string; count: number }[];
  jobTypeDistribution: { type: string; count: number }[];

  recentJobViews: JobView[];
}