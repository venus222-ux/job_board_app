import { useEffect, useState } from "react";
import API from "../../api";
import "./FiltersSidebar.css";

interface Skill {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function FiltersSidebar({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: (f: any) => void;
}) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    categories: true,
    location: true,
    jobType: true,
    experience: true,
    salary: true,
    sort: true,
  });

  useEffect(() => {
    API.get("/skills").then((res) => setSkills(res.data));
    API.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const toggleArrayFilter = (field: "skills" | "category", value: string) => {
    const current = filters[field] || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [field]: updated });
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      skills: [],
      category: [],
      job_type: "",
      experience_level: "",
      is_remote: false,
      salary_min: "",
      salary_max: "",
      sort: "relevance",
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const activeFiltersCount = [
    filters.location,
    ...filters.skills,
    ...filters.category,
    filters.job_type,
    filters.experience_level,
    filters.is_remote ? "remote" : null,
    filters.salary_min,
    filters.salary_max,
    filters.sort !== "relevance" ? filters.sort : null,
  ].filter(Boolean).length;

  return (
    <div className="filters-sidebar">
      <div className="filters-header">
        <h3 className="filters-title">
          <span className="filters-icon">⚡</span>
          Filters
          {activeFiltersCount > 0 && (
            <span className="filters-badge">{activeFiltersCount}</span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button className="filters-reset-btn" onClick={resetFilters}>
            <span>🔄</span> Reset all
          </button>
        )}
      </div>

      {/* Location */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("location")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">📍</span>
            Location
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.location ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.location && (
          <div className="filter-section-content">
            <div className="filter-input-wrapper">
              <input
                className="filter-input"
                placeholder="e.g., Bucharest, Cluj..."
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              />
              {filters.location && (
                <button
                  className="filter-clear-btn"
                  onClick={() => setFilters({ ...filters, location: "" })}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("skills")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">🛠️</span>
            Skills
            {filters.skills.length > 0 && (
              <span className="filter-count-badge">
                {filters.skills.length}
              </span>
            )}
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.skills ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.skills && (
          <div className="filter-section-content">
            <div className="filter-search">
              <input
                type="text"
                placeholder="Search skills..."
                className="filter-search-input"
              />
            </div>
            <div className="filter-checkbox-group">
              {skills.map((skill) => (
                <label key={skill.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.skills.includes(skill.name)}
                    onChange={() => toggleArrayFilter("skills", skill.name)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">{skill.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("categories")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">📂</span>
            Categories
            {filters.category.length > 0 && (
              <span className="filter-count-badge">
                {filters.category.length}
              </span>
            )}
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.categories ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.categories && (
          <div className="filter-section-content">
            <div className="filter-checkbox-group">
              {categories.map((cat) => (
                <label key={cat.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(cat.name)}
                    onChange={() => toggleArrayFilter("category", cat.name)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Type */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("jobType")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">💼</span>
            Job Type
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.jobType ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.jobType && (
          <div className="filter-section-content">
            <select
              className="filter-select"
              value={filters.job_type}
              onChange={(e) =>
                setFilters({ ...filters, job_type: e.target.value })
              }
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("experience")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">📈</span>
            Experience
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.experience ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.experience && (
          <div className="filter-section-content">
            <select
              className="filter-select"
              value={filters.experience_level}
              onChange={(e) =>
                setFilters({ ...filters, experience_level: e.target.value })
              }
            >
              <option value="">Any Level</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead / Manager</option>
              <option value="executive">Executive</option>
            </select>

            <label className="filter-checkbox" style={{ marginTop: "0.75rem" }}>
              <input
                type="checkbox"
                checked={filters.is_remote}
                onChange={(e) =>
                  setFilters({ ...filters, is_remote: e.target.checked })
                }
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">
                <span className="filter-remote-icon">🌍</span> Remote Only
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("salary")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">💰</span>
            Salary Range
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.salary ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.salary && (
          <div className="filter-section-content">
            <div className="salary-range">
              <div className="salary-input-wrapper">
                <span className="salary-currency">$</span>
                <input
                  className="salary-input"
                  placeholder="Min"
                  type="number"
                  value={filters.salary_min}
                  onChange={(e) =>
                    setFilters({ ...filters, salary_min: e.target.value })
                  }
                />
              </div>
              <div className="salary-input-wrapper">
                <span className="salary-currency">$</span>
                <input
                  className="salary-input"
                  placeholder="Max"
                  type="number"
                  value={filters.salary_max}
                  onChange={(e) =>
                    setFilters({ ...filters, salary_max: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="salary-presets">
              <button className="salary-preset-btn">0-50k</button>
              <button className="salary-preset-btn">50-100k</button>
              <button className="salary-preset-btn">100-150k</button>
              <button className="salary-preset-btn">150k+</button>
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection("sort")}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">📅</span>
            Sort By
          </span>
          <span
            className={`filter-section-arrow ${expandedSections.sort ? "expanded" : ""}`}
          >
            ▼
          </span>
        </button>
        {expandedSections.sort && (
          <div className="filter-section-content">
            <select
              className="filter-select"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="relevance">Most Relevant</option>
              <option value="date">Newest First</option>
              <option value="salary_desc">Highest Salary</option>
              <option value="salary_asc">Lowest Salary</option>
            </select>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="active-filters">
          <h4 className="active-filters-title">Active Filters</h4>
          <div className="active-filters-list">
            {filters.location && (
              <span className="active-filter-tag">
                📍 {filters.location}
                <button
                  onClick={() => setFilters({ ...filters, location: "" })}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.skills.map((skill: string) => (
              <span key={skill} className="active-filter-tag">
                ⚙️ {skill}
                <button onClick={() => toggleArrayFilter("skills", skill)}>
                  ✕
                </button>
              </span>
            ))}
            {filters.category.map((cat: string) => (
              <span key={cat} className="active-filter-tag">
                📂 {cat}
                <button onClick={() => toggleArrayFilter("category", cat)}>
                  ✕
                </button>
              </span>
            ))}
            {filters.job_type && (
              <span className="active-filter-tag">
                💼 {filters.job_type.replace("-", " ")}
                <button
                  onClick={() => setFilters({ ...filters, job_type: "" })}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.experience_level && (
              <span className="active-filter-tag">
                📈 {filters.experience_level}
                <button
                  onClick={() =>
                    setFilters({ ...filters, experience_level: "" })
                  }
                >
                  ✕
                </button>
              </span>
            )}
            {filters.is_remote && (
              <span className="active-filter-tag">
                🌍 Remote
                <button
                  onClick={() => setFilters({ ...filters, is_remote: false })}
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
