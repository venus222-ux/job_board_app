// frontend/src/pages/Company/CompanyForm.tsx
import { useState } from "react";
import { toast } from "react-toastify";

interface CompanyFormProps {
  company?: any;
  onSubmit: (formData: FormData, isUpdate: boolean) => void;
  onClose: () => void;
}

export function CompanyForm({ company, onSubmit, onClose }: CompanyFormProps) {
  const [name, setName] = useState(company?.name || "");
  const [description, setDescription] = useState(company?.description || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    company?.logo ? `http://localhost:8000/storage/${company.logo}` : null,
  );

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Name is required");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());

    if (website.trim()) {
      let finalWebsite = website.trim();
      if (!/^https?:\/\//i.test(finalWebsite))
        finalWebsite = `https://${finalWebsite}`;
      formData.append("website", finalWebsite);
    }

    if (logo) formData.append("logo", logo);
    if (company) formData.append("_method", "PUT");

    onSubmit(formData, !!company);
  };

  return (
    <div className="card p-3 mb-3">
      <h4>{company ? "Edit Company" : "Create Company"}</h4>

      <input
        className="form-control mb-2"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="form-control mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <input
        type="file"
        className="form-control mb-2"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setLogo(file);
          if (file) setPreview(URL.createObjectURL(file));
        }}
      />

      {preview && <img src={preview} width={120} className="mb-2" />}

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
