//frontend/src/pages/Jobs/EmployerJobApplication.tsx
import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";

interface Application {
  id: number;
  created_at: string;
  viewed_at?: string;
  candidate: {
    name: string;
    email: string;
  };
  resume_path: string;
}

export default function EmployerJobApplications({ jobId }: { jobId: number }) {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    API.get(`/employer/jobs/${jobId}/applications`).then((res) =>
      setApps(res.data),
    );
  }, [jobId]);

  const markViewed = async (id: number) => {
    await API.patch(`/applications/${id}/view`);
    setApps((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, viewed_at: new Date().toISOString() } : a,
      ),
    );
    toast.success("Marked as viewed");
  };

  return (
    <div className="mt-3">
      <h5>📄 Applications</h5>

      {apps.length === 0 && <p>No applications</p>}

      {apps.map((app) => (
        <div key={app.id} className="card p-3 mb-2">
          <strong>{app.candidate.name}</strong>
          <p className="mb-1">{app.candidate.email}</p>

          <a
            href={`http://localhost:8000/storage/${app.resume_path}`}
            target="_blank"
            className="btn btn-sm btn-outline-primary me-2"
          >
            View Resume
          </a>

          {!app.viewed_at ? (
            <button
              className="btn btn-sm btn-success"
              onClick={() => markViewed(app.id)}
            >
              Mark Viewed
            </button>
          ) : (
            <span className="badge bg-secondary">Viewed</span>
          )}
        </div>
      ))}
    </div>
  );
}
