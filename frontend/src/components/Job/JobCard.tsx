import { Link } from "react-router-dom";
import { Job } from "../../types/job";
import { memo, useMemo } from "react";

interface Props {
  job: Job;
  showStatus?: boolean; // optional
}

const JobCard = ({ job, showStatus = false }: Props) => {
  const jobSlug = job.slug;

  // Memoize formatted salary string
  const salaryText = useMemo(() => {
    if (!job.salary_min) return null;

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: job.salary_currency || "USD",
      maximumFractionDigits: 0,
    });

    const min = formatter.format(job.salary_min);
    const max =
      job.salary_max && job.salary_max !== job.salary_min
        ? ` - ${formatter.format(job.salary_max)}`
        : "";

    const period = job.salary_type === "hourly" ? "hr" : "mo";
    return `${min}${max} / ${period}`;
  }, [job.salary_min, job.salary_max, job.salary_currency, job.salary_type]);

  return (
    <div className="job-card">
      <div className="job-header">
        <h5 className="job-title">{job.title}</h5>
        {showStatus && job.status && (
          <span className={`job-status ${job.status}`}>
            {job.status === "published" && "✅ "}
            {job.status === "draft" && "📝 "}
            {job.status === "closed" && "🔒 "}
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        )}
      </div>

      <p className="job-description">
        <span role="img" aria-label="company">
          🏢
        </span>{" "}
        {job.company?.name || "Company not specified"}
      </p>

      <div className="job-details">
        <span className="job-detail location">
          <span role="img" aria-label="location">
            📍
          </span>{" "}
          {job.location}
        </span>

        {job.experience_level && (
          <span className="job-detail level">
            <span role="img" aria-label="experience">
              ⚡
            </span>{" "}
            {job.experience_level.charAt(0).toUpperCase() +
              job.experience_level.slice(1)}{" "}
            level
          </span>
        )}

        {job.job_type && (
          <span className="job-detail type">
            <span role="img" aria-label="job type">
              ⏰
            </span>{" "}
            {job.job_type.replace("-", " ")}
          </span>
        )}

        {salaryText && (
          <span className="job-detail salary">
            <span role="img" aria-label="salary">
              💰
            </span>{" "}
            <span className="job-salary">{salaryText}</span>
          </span>
        )}

        {job.is_remote && (
          <span className="job-detail remote">
            <span role="img" aria-label="remote">
              🌍
            </span>{" "}
            Remote
          </span>
        )}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="job-footer">
          <div className="job-meta">
            {job.categories && job.categories.length > 0 && (
              <span className="job-badge">
                <span role="img" aria-label="category">
                  📂
                </span>{" "}
                {job.categories[0].name}
              </span>
            )}
            {job.skills.slice(0, 3).map((skill) => (
              <span key={skill.id} className="job-badge skill">
                <span role="img" aria-label="skill">
                  ⚙️
                </span>{" "}
                {skill.name}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="job-badge">
                <span role="img" aria-label="more">
                  ➕
                </span>{" "}
                {job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <Link
        to={`/jobs/${jobSlug}`}
        className={`job-action-btn view ${!jobSlug ? "disabled" : ""}`}
        onClick={(e) => !jobSlug && e.preventDefault()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "white",
          textDecoration: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontWeight: 600,
          marginTop: "1rem",
          width: "100%",
          border: "none",
          cursor: jobSlug ? "pointer" : "not-allowed",
          opacity: jobSlug ? 1 : 0.5,
        }}
      >
        <span role="img" aria-label="view">
          🔍
        </span>
        View Job Details
      </Link>
    </div>
  );
};

// Memoized to avoid unnecessary re-renders
export default memo(JobCard);
