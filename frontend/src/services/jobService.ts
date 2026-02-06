import API from "../api";

export const jobService = {
  getEmployerJobs: (companyId: number) =>
    API.get(`/employer/companies/${companyId}/jobs`),

  changeStatus: (id: number, status: string) =>
    API.patch(`/employer/jobs/${id}/status`, { status }),

  getJobBySlug: (slug: string) => API.get(`/jobs/${slug}`),

  apply: (slug: string, formData: FormData) =>
    API.post(`/jobs/${slug}/apply`, formData),

  recordView: (id: number) => API.post(`/jobs/${id}/view`),

  getMyApplications: () => API.get("/my-applications"),

  searchJobs: (params: any) => API.get("/search/jobs", { params }),
};
