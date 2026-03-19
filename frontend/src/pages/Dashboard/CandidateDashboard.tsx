import { useEffect, useState } from "react";
import API from "../../api";
import { Application } from "../../types/job";

export default function CandidateDashboard() {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    API.get("/my-applications").then((res) => setApps(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>📄 My Applications</h2>

      {apps.length === 0 && <p>No applications yet</p>}

      {apps.map((app) => (
        <div key={app.id} className="card p-3 mb-2">
          <strong>{app.job.title}</strong>
          <p className="mb-1 text-muted">
            🏢 {app.job.company.name} | 📍 {app.job.location}
          </p>
          <small>
            Applied: {new Date(app.created_at).toLocaleDateString()}
          </small>
          {app.viewed_at && (
            <span className="badge bg-success ms-2">Viewed</span>
          )}
        </div>
      ))}
    </div>
  );
}
