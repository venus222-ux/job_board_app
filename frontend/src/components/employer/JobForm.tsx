import { useEffect, useState } from "react";
import API from "../../api";
import { Job, Skill, Category } from "../../types/job";

interface JobFormProps {
  job?: Job | null;
  onSubmit: (form: Job) => void;
  onClose: () => void;
}

export default function JobForm({ job, onSubmit, onClose }: JobFormProps) {
  const [form, setForm] = useState<Job>({
    id: job?.id || 0,
    company: job?.company || { id: 0, name: "" }, // default company
    title: job?.title || "",
    description: job?.description || "",
    location: job?.location || "",
    status: job?.status || "draft",
    categories: job?.categories || [],
    skills: job?.skills || [],
    job_type: job?.job_type || "",
    salary_min: job?.salary_min || 0,
    salary_max: job?.salary_max || 0,
    salary_currency: job?.salary_currency || "",
    salary_type: job?.salary_type || "monthly",
    is_remote: job?.is_remote || false,
    experience_level: job?.experience_level || "junior",
    slug: job?.slug || "",
  });

  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    API.post("https://countriesnow.space/api/v0.1/countries/cities", {
      country: "Romania",
    })
      .then((res: any) => setCities(["Remote", ...res.data.data]))
      .catch(() => setCities(["Remote"]))
      .finally(() => setLoadingCities(false));

    API.get("/skills")
      .then((res) => setAllSkills(res.data))
      .catch(() => setAllSkills([]));
    API.get("/categories")
      .then((res) => setAllCategories(res.data))
      .catch(() => setAllCategories([]));
  }, []);

  const handleSubmit = () => {
    const preparedForm: Job = {
      ...form,
      categories: form.categories || [],
      skills: form.skills || [],
      salary_min: form.salary_min || undefined,
      salary_max: form.salary_max || undefined,
      salary_currency: form.salary_currency || undefined,
      job_type: form.job_type || undefined,
      experience_level: form.experience_level || undefined,
      location: form.location || "",
      is_remote: !!form.is_remote,
    };
    onSubmit(preparedForm);
  };

  return (
    <div className="card p-3 mb-3">
      <h4>{job ? "Edit Job" : "Create Job"}</h4>

      <input
        className="form-control mb-2"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        className="form-control mb-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <select
        className="form-select mb-2"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        disabled={loadingCities}
      >
        <option value="">
          {loadingCities ? "Loading cities..." : "Select location"}
        </option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* Categories */}
      <div className="mb-2">
        <label>Categories</label>
        <select
          className="form-select"
          multiple
          value={(form.categories || []).map((c) => String(c.id))} // or String(c.name) depending on value
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(
              (o) => o.value,
            );
            setForm({
              ...form,
              categories: selected.map((name) => ({ id: 0, name })), // id can be 0 or map properly
            });
          }}
        >
          {allCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Skills */}
      <div className="mb-2">
        <label>Skills</label>
        <select
          className="form-select"
          multiple
          // ✅ Default to empty array if undefined
          value={(form.skills || []).map((s) => String(s.id))}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) =>
              Number(o.value),
            );
            setForm({
              ...form,
              // ✅ Convert selected IDs to Skill objects
              skills: selected.map((id) => ({
                id,
                name: allSkills.find((s) => s.id === id)?.name || "",
              })),
            });
          }}
        >
          {allSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
      </div>

      {/* Other fields */}
      <select
        className="form-select mb-2"
        value={form.status}
        onChange={(e) =>
          setForm({ ...form, status: e.target.value as Job["status"] })
        }
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="closed">Closed</option>
      </select>

      <select
        className="form-select mb-2"
        value={form.job_type || ""}
        onChange={(e) => setForm({ ...form, job_type: e.target.value })}
      >
        <option value="">Job Type</option>
        <option value="full-time">Full-time</option>
        <option value="part-time">Part-time</option>
        <option value="contract">Contract</option>
      </select>

      <div className="d-flex gap-2 mb-2">
        <input
          type="number"
          className="form-control"
          placeholder="Salary Min"
          value={form.salary_min || ""}
          onChange={(e) =>
            setForm({ ...form, salary_min: Number(e.target.value) })
          }
        />
        <input
          type="number"
          className="form-control"
          placeholder="Salary Max"
          value={form.salary_max || ""}
          onChange={(e) =>
            setForm({ ...form, salary_max: Number(e.target.value) })
          }
        />
        <input
          type="text"
          className="form-control"
          placeholder="Currency"
          value={form.salary_currency || ""}
          onChange={(e) =>
            setForm({ ...form, salary_currency: e.target.value })
          }
        />
      </div>

      <select
        className="form-select mb-2"
        value={form.salary_type || "monthly"}
        onChange={(e) =>
          setForm({ ...form, salary_type: e.target.value as any })
        }
      >
        <option value="hourly">Hourly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <select
        className="form-select mb-2"
        value={form.experience_level || "junior"}
        onChange={(e) =>
          setForm({ ...form, experience_level: e.target.value as any })
        }
      >
        <option value="junior">Junior</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
      </select>

      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={form.is_remote}
          onChange={(e) => setForm({ ...form, is_remote: e.target.checked })}
          id="isRemote"
        />
        <label className="form-check-label" htmlFor="isRemote">
          Remote
        </label>
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Save
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
