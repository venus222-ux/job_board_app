// frontend/src/pages/Jobs/JobList.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

import { jobService } from "../../services/jobService";
import JobCard from "../../components/Job/JobCard";
import SearchBar from "../../components/Search/SearchBar";
import FiltersSidebar from "../../components/Search/FiltersSidebar";
import { Job } from "../../types/job";
import { useDebounce } from "../../hooks/useDebounce";

import "./JobsList.css";

const JobsList = () => {
  const [params, setParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [filters, setFilters] = useState({
    location: params.get("location") || "",
    skills: params.get("skills")?.split(",").filter(Boolean) || [],
    category: params.get("category")?.split(",").filter(Boolean) || [],
    job_type: params.get("job_type") || "",
    experience_level: params.get("experience_level") || "",
    is_remote: params.get("is_remote") === "true",
    salary_min: params.get("salary_min") || "",
    salary_max: params.get("salary_max") || "",
    sort: params.get("sort") || "relevance",
  });

  // --- Fetch jobs ---
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.searchJobs({
        q: debouncedQuery,
        location: filters.location,
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        is_remote: filters.is_remote,
        salary_min: filters.salary_min,
        salary_max: filters.salary_max,
        sort: filters.sort,
        skills: filters.skills.filter(Boolean).join(","),
        category: filters.category.filter(Boolean).join(","),
      });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Update URL query params when filters/search change ---
  useEffect(() => {
    setParams({
      q: searchQuery,
      location: filters.location,
      job_type: filters.job_type,
      experience_level: filters.experience_level,
      is_remote: String(filters.is_remote),
      salary_min: filters.salary_min,
      salary_max: filters.salary_max,
      sort: filters.sort,
      skills: filters.skills.join(","),
      category: filters.category.join(","),
    });
  }, [searchQuery, filters, setParams]);

  // --- Fetch jobs when filters/search debounce changes ---
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters]);

  return (
    <div className="container-fluid p-4 mt-4">
      <div className="mb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="row">
        <div className="col-md-3">
          <FiltersSidebar filters={filters} setFilters={setFilters} />
        </div>

        <div className="col-md-9">
          <h2 className="mb-4">💼 Job Listings</h2>

          {loading && <p>Loading jobs...</p>}
          {!loading && jobs.length === 0 && <p>No jobs found.</p>}

          <div className="row">
            <div style={{ height: "75vh", width: "100%" }}>
              <VirtuosoGrid
                totalCount={jobs.length}
                useWindowScroll
                itemContent={(index) => (
                  <JobCard job={jobs[index]} showStatus={false} />
                )}
                listClassName="jobs-grid-container"
                components={{
                  Item: ({ children, ...props }) => (
                    <div {...props} className="job-grid-item">
                      {children}
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsList;
