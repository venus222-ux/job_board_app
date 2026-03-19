// frontend/src/pages/Company/EmployerJobs.tsx
import { useEmployerJobs } from "../../hooks/useEmployerJobs";

export default function EmployerJobs({ companyId }: { companyId: number }) {
  const { jobs, changeStatus } = useEmployerJobs(companyId);

  return (
    <div>
      {jobs.map((job) => (
        <div key={job.id}>
          {job.title}{" "}
          <button onClick={() => changeStatus(job.id, "published")}>
            Publish
          </button>
        </div>
      ))}
    </div>
  );
}
