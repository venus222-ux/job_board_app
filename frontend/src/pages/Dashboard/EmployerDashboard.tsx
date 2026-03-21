import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import { AxiosResponse } from "axios"; // ✅ Add this
import CompanyForm from "../../components/employer/CompanyForm";
import JobForm from "../../components/employer/JobForm";
import { Link } from "react-router-dom";
import { Company, Job } from "../../types/job";
import "./EmployerDashboard.css";

// ------------------- COMPONENT -------------------
export default function EmployerDashboard() {
  // Companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);

  // Loading / pagination
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ------------------- EFFECTS -------------------
  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (company) fetchJobs(currentPage);
  }, [company, currentPage]);

  // ------------------- API FUNCTIONS -------------------
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res: AxiosResponse<Company[]> = await API.get(
        "/employer/companies",
      );
      setCompanies(res.data);
      if (!company && res.data.length > 0) setCompany(res.data[0]);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (page = 1) => {
    if (!company) return;
    try {
      const res: AxiosResponse<any> = await API.get(
        `/employer/companies/${company.id}/jobs?page=${page}`,
      );

      const jobsWithData: Job[] = res.data.data.map((job: any) => ({
        ...job,
        categories: Array.isArray(job.categories)
          ? job.categories
          : job.categories
            ? JSON.parse(job.categories)
            : [],
        skills: Array.isArray(job.skills)
          ? job.skills
          : job.skills
            ? JSON.parse(job.skills)
            : [],
        applications: [],
      }));

      setJobs(jobsWithData);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);

      // fetch applications for jobs
      fetchApplicationsForJobs(jobsWithData);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  const fetchApplicationsForJobs = async (jobsList: Job[]) => {
    if (!company) return;
    try {
      const res: AxiosResponse<Job[]> = await API.get(
        `/employer/companies/${company.id}/jobs-with-applications`,
      );
      const jobsWithApplications = res.data;

      setJobs(
        jobsList.map((job) => {
          const jobWithApps = jobsWithApplications.find((j) => j.id === job.id);
          return {
            ...job,
            applications: jobWithApps?.applications || [],
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load applications", error);
    }
  };

  // ------------------- HANDLERS -------------------
  const handleCompanySubmit = async (formData: FormData, isUpdate: boolean) => {
    try {
      let res: AxiosResponse<Company>;
      if (isUpdate && companyToEdit) {
        res = await API.post(
          `/employer/companies/${companyToEdit.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setCompanies(
          companies.map((c) => (c.id === companyToEdit.id ? res.data : c)),
        );
        toast.success("Company updated successfully");
      } else {
        res = await API.post("/employer/companies", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCompanies([res.data, ...companies]);
        toast.success("Company created successfully");
      }
      setShowCompanyForm(false);
      setCompanyToEdit(null);
    } catch {
      toast.error("Failed to save company");
    }
  };

  const handleJobSubmit = async (form: Job) => {
    if (!company) return;

    // Format payload for Laravel validation
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      status: form.status || "draft", // required
      categories: form.categories?.map((c) => c.name) || [],
      skills: form.skills?.map((s) => s.id) || [],
      job_type: form.job_type || null,
      salary_min: form.salary_min || null,
      salary_max: form.salary_max || null,
      salary_currency: form.salary_currency || null,
      salary_type: form.salary_type || null,
      is_remote: !!form.is_remote,
      experience_level: form.experience_level || "junior",
    };

    try {
      let res: AxiosResponse<Job>;
      if (jobToEdit) {
        res = await API.put(`/employer/jobs/${jobToEdit.id}`, payload);
        setJobs(jobs.map((j) => (j.id === jobToEdit.id ? res.data : j)));
        toast.success("Job updated successfully");
      } else {
        res = await API.post(`/employer/companies/${company.id}/jobs`, payload);
        setJobs([res.data, ...jobs]);
        toast.success("Job created successfully");
      }
      setShowJobForm(false);
      setJobToEdit(null);
    } catch (error: any) {
      console.error("Job submit error:", error.response?.data);
      toast.error("Failed to save job");
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await API.delete(`/employer/companies/${companyId}`);
      setCompanies(companies.filter((c) => c.id !== companyId));
      if (company?.id === companyId) {
        setCompany(companies.length > 1 ? companies[1] : null);
      }
      toast.success("Company deleted successfully");
    } catch {
      toast.error("Failed to delete company");
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await API.delete(`/employer/jobs/${jobId}`);
      setJobs(jobs.filter((j) => j.id !== jobId));
      toast.success("Job deleted successfully");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleMarkAsViewed = async (appId: number) => {
    try {
      await API.patch(`/applications/${appId}/view`);
      toast.success("Marked as viewed");
      if (!company) return;

      const res: AxiosResponse<Job[]> = await API.get(
        `/employer/companies/${company.id}/jobs-with-applications`,
      );
      const jobsWithApplications = res.data;

      setJobs(
        jobs.map((job) => {
          const jobWithApps = jobsWithApplications.find((j) => j.id === job.id);
          return {
            ...job,
            applications: jobWithApps?.applications || [],
          };
        }),
      );
    } catch {
      toast.error("Failed to mark as viewed");
    }
  };

  const downloadResume = async (id: number) => {
    try {
      const response = await API.get(`/employer/applications/${id}/resume`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = "resume.pdf";

      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match && match[1]) filename = match[1].replace(/['"]/g, "");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Resume download started");
    } catch {
      toast.error("Failed to download resume");
    }
  };

  const toggleApplications = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // ------------------- PAGINATION -------------------
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // ------------------- RENDER -------------------
  if (loading)
    return (
      <div className="employer-dashboard">
        <div
          className="loading-container"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="loading-content"
            style={{ textAlign: "center", color: "white" }}
          >
            <div
              className="loading-spinner"
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                borderTopColor: "white",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.5rem",
              }}
            />
            <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="employer-dashboard">
      {/* Header */}
      <header className="employer-header">
        <h1 className="employer-title">Employer Dashboard</h1>
      </header>

      {/* Stats Overview */}
      {company && (
        <div className="stats-overview">
          <div className="stat-card jobs">
            <div className="stat-label">Active Jobs</div>
            <div className="stat-value">
              {jobs.filter((j) => j.status === "published").length}
            </div>
            <div className="stat-icon">💼</div>
          </div>
          <div className="stat-card applications">
            <div className="stat-label">Total Jobs</div>
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-icon">📄</div>
          </div>
          <div className="stat-card companies">
            <div className="stat-label">Companies</div>
            <div className="stat-value">{companies.length}</div>
            <div className="stat-icon">🏢</div>
          </div>
        </div>
      )}

      {/* Company Switcher */}
      <div className="company-switcher">
        {companies.map((c) => (
          <button
            key={c.id}
            className={`company-switcher-btn ${company?.id === c.id ? "active" : ""}`}
            onClick={() => setCompany(c)}
          >
            {c.logo && (
              <img
                src={`http://localhost:8000/storage/${c.logo}`}
                width={20}
                height={20}
                style={{ borderRadius: "4px" }}
                alt=""
              />
            )}
            {c.name}
          </button>
        ))}
        <button
          className="company-switcher-btn add"
          onClick={() => {
            setCompanyToEdit(null);
            setShowCompanyForm(true);
          }}
        >
          Add Company
        </button>
      </div>

      {/* Company Profile */}
      {company && (
        <div className="employer-content">
          <div className="company-profile">
            {company.logo && (
              <img
                src={`http://localhost:8000/storage/${company.logo}`}
                className="company-logo"
                alt={company.name}
              />
            )}
            <div className="company-info">
              <h2 className="company-name">{company.name}</h2>
              {company.description && (
                <p className="company-description">{company.description}</p>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="company-website"
                >
                  {company.website}
                </a>
              )}
            </div>
            <div className="company-actions">
              <button
                className="company-action-btn edit"
                onClick={() => {
                  setCompanyToEdit(company);
                  setShowCompanyForm(true);
                }}
              >
                ✏️ Edit Company
              </button>
              <button
                className="company-action-btn delete"
                onClick={() => handleDeleteCompany(company.id)}
              >
                🗑️ Delete Company
              </button>
              <button
                className="company-action-btn add-job"
                onClick={() => {
                  setJobToEdit(null);
                  setShowJobForm(true);
                }}
              >
                ➕ Add Job
              </button>
            </div>
          </div>

          {/* Jobs Section */}
          <div className="jobs-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h3 className="section-title">Jobs</h3>
                <span className="section-badge">
                  {jobs.length} on this page
                </span>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h4 className="empty-title">No Jobs Yet</h4>
                <p className="empty-message">
                  Get started by creating your first job posting. Click the "Add
                  Job" button above to create a new job.
                </p>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {jobs.map((job) => (
                    <div key={job.id} className="job-card">
                      <div className="job-header">
                        <h4 className="job-title">{job.title}</h4>
                        <span className={`job-status ${job.status}`}>
                          {job.status}
                        </span>
                      </div>
                      {job.description && (
                        <p className="job-description">{job.description}</p>
                      )}
                      <div className="job-details">
                        <span className="job-detail location">
                          {job.location}
                        </span>
                        {job.experience_level && (
                          <span className="job-detail level">
                            {job.experience_level}
                          </span>
                        )}
                        {job.job_type && (
                          <span className="job-detail type">
                            {job.job_type}
                          </span>
                        )}
                        {job.salary_min && job.salary_max && (
                          <span className="job-detail salary">
                            <span className="job-salary">
                              {job.salary_min}-{job.salary_max}{" "}
                              {job.salary_currency}/{job.salary_type}
                            </span>
                          </span>
                        )}
                        {job.is_remote && (
                          <span className="job-detail remote">Remote</span>
                        )}
                      </div>

                      <div className="job-meta">
                        {job.categories && job.categories.length > 0 && (
                          <span className="job-badge">
                            {job.categories[0].name}
                          </span>
                        )}
                        {job.skills &&
                          job.skills.length > 0 &&
                          job.skills.slice(0, 3).map((skill) => (
                            <span key={skill.id} className="job-badge skill">
                              {skill.name}
                            </span>
                          ))}
                        {job.skills && job.skills.length > 3 && (
                          <span className="job-badge">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="job-footer">
                        {job.applications && job.applications.length > 0 ? (
                          <button
                            className={`applications-count ${expandedJobId === job.id ? "expanded" : ""}`}
                            onClick={() => toggleApplications(job.id)}
                          >
                            <span>📋</span>
                            <span>{job.applications.length}</span>
                            <span>
                              Application
                              {job.applications.length !== 1 ? "s" : ""}
                            </span>
                          </button>
                        ) : (
                          <span
                            className="applications-count"
                            style={{ opacity: 0.6, cursor: "default" }}
                          >
                            <span>📋</span>
                            <span>0 Applications</span>
                          </span>
                        )}

                        <div className="job-actions">
                          <Link
                            to={`/jobs/${job.slug}`}
                            className="job-action-btn view"
                          >
                            🔗 View Details
                          </Link>

                          <button
                            className="job-action-btn edit"
                            onClick={() => {
                              setJobToEdit(job);
                              setShowJobForm(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="job-action-btn delete"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Applications List */}
                      {expandedJobId === job.id &&
                        job.applications &&
                        job.applications.length > 0 && (
                          <div className="applications-section">
                            <h5 className="applications-title">
                              📋 Applications ({job.applications.length})
                            </h5>
                            <ul className="applications-list">
                              {job.applications.map((app) => (
                                <li key={app.id} className="application-item">
                                  <div className="application-content">
                                    <div className="applicant-info">
                                      <div className="applicant-name">
                                        {app.candidate?.name || "N/A"}
                                        {app.viewed_at && (
                                          <span className="viewed-badge">
                                            ✓ Viewed
                                          </span>
                                        )}
                                      </div>
                                      <div className="applicant-email">
                                        📧 {app.candidate?.email || "N/A"}
                                      </div>
                                    </div>
                                    <div className="application-actions">
                                      <button
                                        className="download-btn"
                                        onClick={() => downloadResume(app.id)}
                                      >
                                        📄 Download CV
                                      </button>
                                      {!app.viewed_at && (
                                        <button
                                          className="mark-viewed-btn"
                                          onClick={() =>
                                            handleMarkAsViewed(app.id)
                                          }
                                        >
                                          ✓ Mark as Viewed
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {expandedJobId === job.id &&
                        (!job.applications ||
                          job.applications.length === 0) && (
                          <div className="applications-empty">
                            No applications yet for this job
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {/* Feature-Rich Pagination */}
                {lastPage > 1 && (
                  <div className="pagination-container">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      ← Prev
                    </button>

                    <div className="pagination-numbers">
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span key={`dots-${index}`} className="page-ellipsis">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`page-number ${currentPage === page ? "active" : ""}`}
                          >
                            {page}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, lastPage))
                      }
                      disabled={currentPage === lastPage}
                      className="pagination-button"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* No Company Selected */}
      {!company && companies.length === 0 && (
        <div className="employer-content">
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h4 className="empty-title">No Companies Yet</h4>
            <p className="empty-message">
              Get started by creating your first company profile. Click the "Add
              Company" button above to get started.
            </p>
          </div>
        </div>
      )}

      {/* Company Form Modal */}
      {showCompanyForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3 className="form-title">
                {companyToEdit ? "Edit Company" : "Create Company"}
              </h3>
              <button
                className="form-close-btn"
                onClick={() => {
                  setShowCompanyForm(false);
                  setCompanyToEdit(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="form-content">
              <CompanyForm
                company={companyToEdit}
                onSubmit={handleCompanySubmit}
                onClose={() => {
                  setShowCompanyForm(false);
                  setCompanyToEdit(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3 className="form-title">
                {jobToEdit ? "Edit Job" : "Create Job"}
              </h3>
              <button
                className="form-close-btn"
                onClick={() => {
                  setShowJobForm(false);
                  setJobToEdit(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="form-content">
              <JobForm
                job={jobToEdit}
                onSubmit={handleJobSubmit}
                onClose={() => {
                  setShowJobForm(false);
                  setJobToEdit(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
