// frontend/src/pages/Jobs/JobPage.tsx
import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { useJob } from "../../hooks/useJob";
import "./JobPage.css";
import DOMPurify from "dompurify";

const JobPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { job, loading, resume, setResume, startApply, countdown, applied } =
    useJob(slug);

  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);

    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setResume(file);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") {
      setResume(file);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const cancelApply = () => {
    toast.info("Application canceled");
  };

  const formatSalary = () => {
    if (!job?.salary_min) return null;
    const min = new Intl.NumberFormat("en-US").format(job.salary_min);
    const max = new Intl.NumberFormat("en-US").format(
      job.salary_max || job.salary_min,
    );
    const currency = job.salary_currency || "";
    const type =
      job.salary_type === "hourly"
        ? "hour"
        : job.salary_type === "monthly"
          ? "month"
          : job.salary_type === "yearly"
            ? "year"
            : job.salary_type;
    return `${min} - ${max} ${currency} per ${type}`;
  };

  const formatJobType = (type: string) => {
    return type
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  if (loading)
    return (
      <div className="job-detail-page">
        <div className="job-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading job details...</p>
        </div>
      </div>
    );

  if (!job)
    return (
      <div className="job-detail-page">
        <div className="job-not-found">
          <div className="not-found-icon">🔍</div>
          <h1 className="not-found-title">Job Not Found</h1>
          <p className="not-found-text">
            The job you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>{job.title} - CareerHub</title>
      </Helmet>

      <div className="job-detail-page">
        <div className="container">
          <div className="row">
            {/* Left Column */}
            <div className="col-lg-8">
              <div className="job-header">
                <h1 className="job-title">{job.title}</h1>

                <div className="job-company">
                  <span className="company-icon">🏢</span>
                  {job.company?.name || "Company not specified"}
                </div>

                <div className="job-location">
                  <span className="location-icon">📍</span>
                  {job.location || "Location not specified"}
                </div>

                <div className="job-meta-grid">
                  {job.job_type && (
                    <div className="meta-card">
                      <div className="meta-label">Job Type</div>
                      <div className="meta-value">
                        <span className="meta-icon">🕒</span>
                        {formatJobType(job.job_type)}
                      </div>
                    </div>
                  )}
                  {job.experience_level && (
                    <div className="meta-card">
                      <div className="meta-label">Experience</div>
                      <div className="meta-value">
                        <span className="meta-icon">📈</span>
                        {job.experience_level.charAt(0).toUpperCase() +
                          job.experience_level.slice(1)}
                      </div>
                    </div>
                  )}
                  {job.salary_min && (
                    <div className="meta-card">
                      <div className="meta-label">Salary</div>
                      <div className="meta-value">
                        <span className="meta-icon">💰</span>
                        {formatSalary()}
                      </div>
                    </div>
                  )}
                  {job.is_remote && (
                    <div className="meta-card">
                      <div className="meta-label">Work Style</div>
                      <div className="meta-value">
                        <span className="meta-icon">🏠</span>
                        Remote
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="description-section">
                <h2 className="section-title">
                  <span className="section-icon">📝</span>
                  Job Description
                </h2>
                import DOMPurify from "dompurify";
                <div
                  className="job-description"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(job.description || ""),
                  }}
                />
              </div>
            </div>

            {/* Right Column */}
            {job.status === "published" && (
              <div className="col-lg-4">
                <div className="application-card">
                  <div className="application-header">
                    <h2 className="application-title">
                      <span>🚀</span>
                      Apply Now
                    </h2>
                    <p className="application-subtitle">
                      Submit your application for this exciting opportunity
                    </p>
                  </div>

                  {applied ? (
                    <div className="applied-state">
                      <div className="applied-icon">✅</div>
                      <h3 className="applied-title">Application Submitted!</h3>
                      <p className="applied-text">
                        Your application has been successfully submitted.
                      </p>
                    </div>
                  ) : countdown ? (
                    <div className="countdown-state">
                      <div className="countdown-timer">{countdown}</div>
                      <p className="countdown-text">
                        Application in progress...
                      </p>
                      <button className="cancel-btn" onClick={cancelApply}>
                        <span>✕</span> Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`file-upload-area ${dragover ? "dragover" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragover(true);
                        }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={handleDrop}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          className="file-input"
                          onChange={handleFileSelect}
                        />
                        <div className="upload-content">
                          <div className="upload-icon">📄</div>
                          <div className="upload-text">Upload Resume</div>
                          <div className="upload-hint">
                            Drag & drop or click to upload PDF (Max 5MB)
                          </div>
                        </div>
                      </div>

                      {resume && (
                        <div className="file-preview">
                          <div className="file-info">
                            <span className="file-icon">📎</span>
                            <span className="file-name">{resume.name}</span>
                          </div>
                          <button
                            className="remove-file"
                            onClick={(e) => {
                              e.stopPropagation();
                              setResume(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <button
                        className={`apply-btn ${!resume ? "disabled" : ""}`}
                        disabled={!resume}
                        onClick={startApply}
                      >
                        <span className="apply-icon">📤</span>
                        {resume
                          ? "Submit Application"
                          : "Upload Resume to Apply"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobPage;
