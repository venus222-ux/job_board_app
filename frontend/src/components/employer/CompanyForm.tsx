import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { Company } from "../../types/job";

interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (formData: FormData, isUpdate: boolean) => void;
  onClose: () => void;
}

export default function CompanyForm({
  company,
  onSubmit,
  onClose,
}: CompanyFormProps) {
  const [name, setName] = useState(company?.name || "");
  const [description, setDescription] = useState(company?.description || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    company?.logo ? `http://localhost:8000/storage/${company.logo}` : null,
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (files) => {
      setLogoFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    },
  });

  useEffect(() => {
    if (company) {
      setName(company.name);
      setDescription(company.description || "");
      setWebsite(company.website || "");
      setPreview(
        company.logo ? `http://localhost:8000/storage/${company.logo}` : null,
      );
      setLogoFile(null);
    } else {
      setName("");
      setDescription("");
      setWebsite("");
      setPreview(null);
      setLogoFile(null);
    }
  }, [company]);

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

    if (logoFile) formData.append("logo", logoFile);
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

      <div {...getRootProps()} className="border p-4 text-center mb-2">
        <input {...getInputProps()} />
        {isDragActive
          ? "Drop logo here"
          : "Drag & drop logo or click to select"}
      </div>

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
