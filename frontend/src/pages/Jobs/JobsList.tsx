// frontend/src/pages/Jobs/JobList.tsx
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

import { jobService } from "../../services/jobService";
import JobCard from "../../components/Job/JobCard";
import SearchBar from "../../components/Search/SearchBar";
import FiltersSidebar from "../../components/Search/FiltersSidebar";
import JobCardSkeleton from "./JobCardSkeleton";
import { Job } from "../../types/job";
import { useDebounce } from "../../hooks/useDebounce";

import styles from "./JobsList.module.css"; // CSS Module

const JobsList = () => {
  const [params, setParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(params.get("query") || "");
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
        query: debouncedQuery || "*",
        location: filters.location,
        job_type: filters.job_type,
        experience_level: filters.experience_level,
        is_remote: filters.is_remote,
        salary_min: filters.salary_min,
        salary_max: filters.salary_max,
        sort: filters.sort,
        skills: filters.skills.filter(Boolean).join(","),
        category: filters.category.join(","),
      });

      const jobsData = Array.isArray(res.data.data) ? res.data.data : [];
      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Sync filters & search to URL ---
  useEffect(() => {
    setParams({
      query: searchQuery,
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

  // --- Fetch jobs on debounced search or filters ---
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters]);

  // --- Memoize skeletons ---
  const renderSkeletons = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className={styles.gridItem}>
        <JobCardSkeleton />
      </div>
    ));
  }, []);

  // --- Memoize Virtuoso item content to prevent re-renders ---
  const itemContent = useMemo(
    () => (index: number) => {
      const job = jobs[index];
      return (
        <div key={job.id} className={styles.gridItem}>
          <JobCard job={job} showStatus={false} />
        </div>
      );
    },
    [jobs],
  );

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <FiltersSidebar filters={filters} setFilters={setFilters} />
        </aside>

        <main className={styles.content}>
          <h2 className={styles.title}>💼 Job Listings</h2>

          {loading ? (
            <div className={styles.gridContainer}>{renderSkeletons}</div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <img
                src="/illustrations/empty-jobs.svg"
                alt="No jobs found"
                className={styles.emptyImage}
              />
              <p>No jobs match your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ height: "75vh", width: "100%" }}>
              <VirtuosoGrid
                totalCount={jobs.length}
                useWindowScroll
                itemContent={itemContent}
                listClassName={styles.gridContainer}
                components={{
                  Item: ({ children, ...props }) => (
                    <div {...props} className={styles.gridItem}>
                      {children}
                    </div>
                  ),
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobsList;
